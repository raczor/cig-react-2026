import { getAccessToken, notifyUnauthorized } from "../auth/token.js";

// The only module that knows the backend URL and calls fetch.
// Vite exposes only VITE_* variables, read at startup.
// Without VITE_API_URL, only the local backend is assumed, and only in development.
const API_URL =
    import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3001/api" : undefined);

// Every call goes through here: one fetch, one `ok` check.
// The Content-Type header only travels with a body, and Authorization only when signed in.
async function request(path, { body, ...options } = {}) {
    if (!API_URL) {
        throw new Error("Falta la variable VITE_API_URL: la aplicación no sabe dónde está la API.");
    }

    const token = await getAccessToken();
    const headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(body !== undefined && { "Content-Type": "application/json" }),
    };

    const response = await fetch(API_URL + path, {
        ...options,
        ...(Object.keys(headers).length > 0 && { headers }),
        ...(body !== undefined && { body: JSON.stringify(body) }),
    });

    // fetch only rejects when there is no response at all; 404 and 500 must be thrown by hand.
    if (!response.ok) {
        if (response.status === 401) notifyUnauthorized();
        // The API explains 401 and 403 in Spanish; other statuses keep the generic message.
        const detail = [401, 403].includes(response.status) ? await response.json().then((b) => b.message, () => undefined) : undefined;
        throw new Error(detail ?? `El servidor respondió ${response.status}`);
    }

    // DELETE answers 204 No Content: there is no body to parse.
    return response.status === 204 ? null : response.json();
}

const api = {
    get: (path, { signal } = {}) => request(path, { signal }),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    patch: (path, body) => request(path, { method: "PATCH", body }),
    delete: (path) => request(path, { method: "DELETE" }),
};

// { signal } has the shape TanStack Query passes to a queryFn, so these can be used directly.
export const getOrders = ({ signal } = {}) => api.get("/orders", { signal });

export const getOrder = (id, { signal } = {}) => api.get(`/orders/${id}`, { signal });

// The server assigns the id, the code and the initial status.
export const createOrder = (data) => api.post("/orders", data);

// PUT replaces the whole order; PATCH merges.
export const updateOrder = (id, order) => api.put(`/orders/${id}`, order);

export const changeStatus = (id, status) => api.patch(`/orders/${id}`, { status });

export const deleteOrder = (id) => api.delete(`/orders/${id}`);
