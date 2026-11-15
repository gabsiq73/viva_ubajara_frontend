import { Component, type ReactNode } from "react";
import { Button } from "./ui/Button";
import StateBlock from "./ui/StateBlock";

interface ChunkErrorBoundaryProps {
    resetKey: string;
    children: ReactNode;
}

export default class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidUpdate(prev: ChunkErrorBoundaryProps) {
        if (this.state.failed && prev.resetKey !== this.props.resetKey) {
            this.setState({ failed: false });
        }
    }

    render() {
        if (!this.state.failed) return this.props.children;
        return (
            <main className="pg-fullscreen" id="conteudo" tabIndex={-1}>
                <StateBlock
                    variant="error"
                    icon="wifi_off"
                    title="Não conseguimos carregar esta página"
                    actions={
                        <Button icon="refresh" onClick={() => window.location.reload()}>
                            Recarregar
                        </Button>
                    }
                >
                    A conexão pode ter oscilado ou o site foi atualizado. Recarregue para tentar de novo.
                </StateBlock>
            </main>
        );
    }
}
