import WelcomeCard from "../../components/WelcomeCard";
import PageHeader from "../../components/PageHeader";

export default function CreatingComponentPage() {
    return (
        <>
            <PageHeader
                title="Create Component"
                description="Learn how to create component. "
            />
            {/* Same component reused twice with different props — the whole point of components */}
            <WelcomeCard name="Test" role="User" />
            <WelcomeCard name="Test 2" role="Admin" />
        </>

    );
}