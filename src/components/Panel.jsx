import Card from "./ui/Card.jsx";

function Panel({ title, children }) {
    return (
        <Card className="mb-4 p-6">
            <h2 className="mb-4 text-xl font-semibold">{title}</h2>
            {children}
        </Card>
    );
}

export default Panel;
