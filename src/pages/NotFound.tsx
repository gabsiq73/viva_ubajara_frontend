import Header from "../components/Header";
import Footer from "../components/Footer";
import { ButtonLink } from "../components/ui/Button";
import PageHero from "../components/ui/PageHero";
import StateBlock from "../components/ui/StateBlock";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import "../components/ui/ui.css";
import "./style/PageState.css";

export default function NotFound() {
    useDocumentTitle("Página não encontrada");

    return (
        <div className="pg-page">
            <Header />
            <main className="pg-main" id="conteudo" tabIndex={-1}>
                <PageHero eyebrow="Erro 404" title="Página não encontrada" />
                <div className="ui-container pg-state">
                    <StateBlock
                        variant="empty"
                        icon="explore_off"
                        title="Não achamos o caminho até aqui"
                        actions={
                            <>
                                <ButtonLink to="/" large icon="home">
                                    Voltar ao início
                                </ButtonLink>
                                <ButtonLink to="/estabelecimentos" variant="outline" large>
                                    Ver estabelecimentos
                                </ButtonLink>
                                <ButtonLink to="/eventos" variant="outline" large>
                                    Ver eventos
                                </ButtonLink>
                            </>
                        }
                    >
                        O endereço pode ter mudado ou ter sido digitado errado. Volte ao início e continue explorando Ubajara.
                    </StateBlock>
                </div>
            </main>
            <Footer />
        </div>
    );
}
