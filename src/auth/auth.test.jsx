import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { authClient } from "./client.js";
import { notifyUnauthorized } from "./token.js";
import * as api from "../services/orders.js";
import { makeOrder } from "../test/fixtures.js";
import { renderWithProviders } from "../test/render.jsx";

// Login on: the client module reports a Neon Auth URL and a fake client stands in for the service.
vi.mock("./client.js", () => ({
    authEnabled: true,
    authClient: {
        getSession: vi.fn(),
        signIn: { email: vi.fn() },
        signUp: { email: vi.fn() },
        signOut: vi.fn(),
        getJWTToken: vi.fn(),
    },
}));
vi.mock("../services/orders.js");

const ana = { id: "user-1", email: "ana@example.com" };
const signedOut = { data: null };
const signedIn = { data: { user: ana, session: {} } };

async function typeCredentials(user, email = "ana@example.com", password = "secret-123") {
    await user.type(screen.getByLabelText("Correo"), email);
    await user.type(screen.getByLabelText("Contraseña"), password);
}

beforeEach(() => {
    vi.resetAllMocks();
    api.getOrders.mockResolvedValue([makeOrder({ id: 5, code: "OS-2026-005" })]);
    api.getOrder.mockResolvedValue(makeOrder({ id: 5, code: "OS-2026-005" }));
    authClient.signOut.mockResolvedValue({});
});

describe("route guard", () => {
    it("sends a signed-out visitor to the login page without requesting any orders", async () => {
        authClient.getSession.mockResolvedValue(signedOut);
        renderWithProviders(<App />);

        expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
        expect(api.getOrders).not.toHaveBeenCalled();
    });

    it("shows a loading message, not the login page, while the session is being read", async () => {
        authClient.getSession.mockReturnValue(new Promise(() => {}));
        renderWithProviders(<App />);

        expect(screen.getByText("Cargando...")).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Iniciar sesión" })).not.toBeInTheDocument();
    });

    it("lets a signed-in user in and shows who they are", async () => {
        authClient.getSession.mockResolvedValue(signedIn);
        renderWithProviders(<App />);

        expect(await screen.findByText("Orden OS-2026-005")).toBeInTheDocument();
        expect(screen.getByText("ana@example.com")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    });

    it("treats a failing session lookup as signed out", async () => {
        authClient.getSession.mockRejectedValue(new Error("network"));
        renderWithProviders(<App />);

        expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    });

    it("keeps /login off limits for someone who is already signed in", async () => {
        authClient.getSession.mockResolvedValue(signedIn);
        renderWithProviders(<App />, { route: "/login" });

        expect(await screen.findByText("Orden OS-2026-005")).toBeInTheDocument();
    });
});

describe("signing in", () => {
    it("signs in and lands on the page that was asked for", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValueOnce(signedOut).mockResolvedValue(signedIn);
        authClient.signIn.email.mockResolvedValue({ data: {} });
        renderWithProviders(<App />, { route: "/orders/5" });

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await typeCredentials(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(authClient.signIn.email).toHaveBeenCalledWith({ email: "ana@example.com", password: "secret-123" });
        expect(await screen.findByRole("heading", { name: "Orden OS-2026-005" })).toBeInTheDocument();
    });

    it("explains a wrong password in Spanish and stays on the login page", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedOut);
        authClient.signIn.email.mockResolvedValue({ error: { code: "INVALID_EMAIL_OR_PASSWORD", message: "Invalid email or password" } });
        renderWithProviders(<App />);

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await typeCredentials(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos.");
        expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    });

    it("never shows the service's English text for an error it does not know", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedOut);
        authClient.signIn.email.mockResolvedValue({ error: { code: "SOMETHING_NEW", message: "Something exploded" } });
        renderWithProviders(<App />);

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await typeCredentials(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent("No se pudo completar la solicitud. Intenta de nuevo.");
        expect(alert).not.toHaveTextContent("exploded");
    });

    it("explains in Spanish that the service cannot be reached, instead of showing the browser's error", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedOut);
        authClient.signIn.email.mockRejectedValue(new TypeError("Failed to fetch"));
        renderWithProviders(<App />);

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await typeCredentials(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent("No se pudo conectar con el servicio de acceso");
        expect(alert).not.toHaveTextContent("Failed to fetch");
    });

    it("validates before calling the service", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedOut);
        renderWithProviders(<App />);

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await typeCredentials(user, "not-an-email", "short");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(screen.getByText("Correo no válido.")).toBeInTheDocument();
        expect(screen.getByText("Mínimo 8 caracteres.")).toBeInTheDocument();
        expect(authClient.signIn.email).not.toHaveBeenCalled();
    });

    it("disables the button while the request runs", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedOut);
        authClient.signIn.email.mockReturnValue(new Promise(() => {}));
        renderWithProviders(<App />);

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await typeCredentials(user);
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByRole("button", { name: "Un momento..." })).toBeDisabled();
    });
});

describe("creating an account", () => {
    it("switches to sign up, names the user after the email and signs in when the service allows it", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValueOnce(signedOut).mockResolvedValue(signedIn);
        authClient.signUp.email.mockResolvedValue({ data: {} });
        renderWithProviders(<App />);

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await user.click(screen.getByRole("button", { name: "Crea una" }));
        expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
        await typeCredentials(user);
        await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

        expect(authClient.signUp.email).toHaveBeenCalledWith({ name: "ana", email: "ana@example.com", password: "secret-123" });
        expect(await screen.findByText("Orden OS-2026-005")).toBeInTheDocument();
    });

    it("asks the user to sign in when the account still needs verification", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedOut);
        authClient.signUp.email.mockResolvedValue({ data: {} });
        renderWithProviders(<App />);

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await user.click(screen.getByRole("button", { name: "Crea una" }));
        await typeCredentials(user);
        await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

        expect(await screen.findByText("Cuenta creada. Inicia sesión para continuar.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    });

    it("also explains an unreachable service when creating an account", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedOut);
        authClient.signUp.email.mockRejectedValue(new TypeError("Failed to fetch"));
        renderWithProviders(<App />);

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await user.click(screen.getByRole("button", { name: "Crea una" }));
        await typeCredentials(user);
        await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servicio de acceso");
    });

    it("reports an email that is already registered", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedOut);
        authClient.signUp.email.mockResolvedValue({ error: { code: "USER_ALREADY_EXISTS" } });
        renderWithProviders(<App />);

        await screen.findByRole("heading", { name: "Iniciar sesión" });
        await user.click(screen.getByRole("button", { name: "Crea una" }));
        await typeCredentials(user);
        await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe una cuenta con ese correo.");
    });
});

describe("signing out and expired sessions", () => {
    it("signs out, drops the cached orders and returns to the login page", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedIn);
        renderWithProviders(<App />);
        await screen.findByText("Orden OS-2026-005");

        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

        expect(authClient.signOut).toHaveBeenCalledTimes(1);
        expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
        expect(screen.queryByText("Orden OS-2026-005")).not.toBeInTheDocument();
    });

    it("does not show the previous user's orders to the next person who signs in", async () => {
        const user = userEvent.setup();
        authClient.getSession.mockResolvedValue(signedIn);
        renderWithProviders(<App />);
        await screen.findByText("Orden OS-2026-005");

        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
        await screen.findByRole("heading", { name: "Iniciar sesión" });

        // The next user's list never arrives: nothing from the first one may be on screen meanwhile.
        api.getOrders.mockReturnValue(new Promise(() => {}));
        authClient.signIn.email.mockResolvedValue({ data: {} });
        authClient.getSession.mockResolvedValue({ data: { user: { id: "user-2", email: "bob@example.com" } } });
        await typeCredentials(user, "bob@example.com");
        await user.click(screen.getByRole("button", { name: "Entrar" }));

        expect(await screen.findByText("Cargando órdenes...")).toBeInTheDocument();
        expect(screen.queryByText("Orden OS-2026-005")).not.toBeInTheDocument();
    });

    it("goes back to the login page when the API reports the session as invalid", async () => {
        authClient.getSession.mockResolvedValue(signedIn);
        renderWithProviders(<App />);
        await screen.findByText("Orden OS-2026-005");

        act(() => notifyUnauthorized());

        expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
        // The cookie session must end too, or getSession would keep reporting a user the API rejects.
        expect(authClient.signOut).toHaveBeenCalledTimes(1);
    });
});
