import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button, ButtonLink } from "../components/ui/Button";
import PageHero from "../components/ui/PageHero";
import StateBlock from "../components/ui/StateBlock";
import "../components/ui/ui.css";
import "./style/PageState.css";

export function PageLoading({ label = "Carregando…", fullPage = false }: { label?: string; fullPage?: boolean }) {
    return (
        <div className={fullPage ? "pg-loading pg-loading--page" : "pg-loading"} role="status">
            <span className="pg-spinner" aria-hidden="true" />
            {label}
        </div>
    );
}

type DetailStatePageProps =
    | { kind: "loading" }
    | {
          kind: "not-found" | "error";
          heroTitle: string;
          breadcrumb: { label: string; to?: string }[];
          noun: string;
          backTo: string;
          backLabel: string;
          onRetry: () => void;
      };

/** Página inteira de um detalhe (evento, atrativo, local) enquanto carrega, falha ou não existe. */
export function DetailStatePage(props: DetailStatePageProps) {
    return (
        <div className="pg-page">
            <Header solid={props.kind === "loading"} />
            <main className="pg-main" id="conteudo" tabIndex={-1}>
                {props.kind === "loading" ? (
                    <PageLoading />
                ) : (
                    <>
                        <PageHero breadcrumb={props.breadcrumb} title={props.heroTitle} />
                        <div className="ui-container pg-state">
                            {props.kind === "not-found" ? (
                                <StateBlock
                                    variant="empty"
                                    icon="search_off"
                                    title={`Não encontramos ${props.noun}`}
                                    actions={
                                        <ButtonLink to={props.backTo} large>
                                            {props.backLabel}
                                        </ButtonLink>
                                    }
                                >
                                    O endereço pode ter mudado ou o cadastro foi removido.
                                </StateBlock>
                            ) : (
                                <StateBlock
                                    variant="error"
                                    icon="wifi_off"
                                    title={`Não conseguimos carregar ${props.noun}`}
                                    actions={
                                        <>
                                            <Button large icon="refresh" onClick={props.onRetry}>
                                                Tentar de novo
                                            </Button>
                                            <ButtonLink to={props.backTo} variant="outline" large>
                                                {props.backLabel}
                                            </ButtonLink>
                                        </>
                                    }
                                >
                                    A conexão na serra pode oscilar. Verifique o sinal e tente de novo.
                                </StateBlock>
                            )}
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
