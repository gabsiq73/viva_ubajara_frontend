import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import "../components/ui/ui.css";
import { useParams, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button, ButtonLink } from "../components/ui/Button";
import PageHero from "../components/ui/PageHero";
import StateBlock from "../components/ui/StateBlock";
import AboutSection from "../components/establishment-detail/AboutSection";
import ClaimSection from "../components/establishment-detail/ClaimSection";
import ContactCard from "../components/establishment-detail/ContactCard";
import DetailHero from "../components/establishment-detail/DetailHero";
import DetailSkeleton from "../components/establishment-detail/DetailSkeleton";
import DirectionsSection from "../components/establishment-detail/DirectionsSection";
import DirectionsSheet from "../components/establishment-detail/DirectionsSheet";
import { BottomBar, QuickActions } from "../components/establishment-detail/MobileActions";
import NearbySection from "../components/establishment-detail/NearbySection";
import PhotoLightbox from "../components/establishment-detail/PhotoLightbox";
import ReviewsSection from "../components/reviews/ReviewsSection";
import SectionBar, { type SectionAnchor } from "../components/establishment-detail/SectionBar";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { buildDirectionLinks } from "../utils/directions";
import {
    buildFacts,
    loadEstablishmentDetail,
    loadNearby,
    parseApiType,
    telHref,
    type DetailLoadResult,
    type EstablishmentDetail,
} from "../utils/establishmentDetail";
import { toFavoriteItem, type Establishment } from "../utils/establishments";
import { loadFavorites, toggleFavorite } from "../utils/favorites";
import { shareLink } from "../utils/share";
import "./style/Estabelecimento.css";

const TOAST_MS = 2200;
const META_DESCRIPTION_MAX = 160;

function truncate(text: string, max: number): string {
    const flat = text.replace(/\s+/g, " ").trim();
    if (flat.length <= max) return flat;
    return `${flat.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function useDocumentMeta(detail: EstablishmentDetail) {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = `${detail.name} · Viva Ubajara`;

        let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        const created = !meta;
        const previousContent = meta?.getAttribute("content") ?? null;
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "description";
            document.head.appendChild(meta);
        }
        if (detail.description) meta.setAttribute("content", truncate(detail.description, META_DESCRIPTION_MAX));

        return () => {
            document.title = previousTitle;
            if (!meta) return;
            if (created) meta.remove();
            else if (previousContent !== null) meta.setAttribute("content", previousContent);
        };
    }, [detail.name, detail.description]);
}

function scrollToSection(id: string) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

function DetailView({ detail }: { detail: EstablishmentDetail }) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [nearby, setNearby] = useState<Establishment[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set(loadFavorites().map((f) => f.id)));
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [toast, setToast] = useState("");
    const openerRef = useRef<HTMLElement | null>(null);
    const toastTimer = useRef<number | undefined>(undefined);

    useDocumentMeta(detail);

    useEffect(() => {
        let cancelled = false;
        loadNearby(detail)
            .then((items) => {
                if (!cancelled) setNearby(items);
            })
            .catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [detail]);

    useEffect(() => () => window.clearTimeout(toastTimer.current), []);

    if (!isMobile && sheetOpen) setSheetOpen(false);

    const hasAddress = detail.address !== "";
    const hasAbout = detail.description !== "" || buildFacts(detail).length > 0;
    const links = useMemo(
        () => buildDirectionLinks({ address: detail.address, mapsUrl: detail.mapsUrl, name: detail.name }),
        [detail.address, detail.mapsUrl, detail.name],
    );

    const anchors: SectionAnchor[] = [];
    if (hasAbout) anchors.push({ id: "sobre", label: "Sobre" });
    if (hasAddress) anchors.push({ id: "como-chegar", label: "Como chegar" });
    anchors.push({ id: "avaliacoes", label: "Avaliações" });
    if (nearby.length > 0) anchors.push({ id: "perto-daqui", label: "Perto daqui" });
    const activeId = useScrollSpy(anchors.map((a) => a.id));

    const favorite = favoriteIds.has(detail.id);

    function handleToggleFavorite(item: Establishment) {
        const nowFavorite = toggleFavorite(toFavoriteItem(item));
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (nowFavorite) next.add(item.id);
            else next.delete(item.id);
            return next;
        });
    }

    function showToast(message: string) {
        setToast(message);
        window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(""), TOAST_MS);
    }

    async function handleShare() {
        const outcome = await shareLink({ title: detail.name, url: window.location.href });
        if (outcome === "copied") showToast("Link copiado");
        else if (outcome === "failed") showToast("Não foi possível copiar o link");
    }

    function openGallery(event: MouseEvent<HTMLElement>) {
        openerRef.current = event.currentTarget;
        setGalleryIndex(0);
    }

    function openSheet(event: MouseEvent<HTMLElement>) {
        openerRef.current = event.currentTarget;
        setSheetOpen(true);
    }

    return (
        <>
            <DetailHero detail={detail} onOpenGallery={openGallery} onShare={handleShare} onGoToReviews={() => scrollToSection("avaliacoes")} />

            {isMobile ? (
                <QuickActions
                    detail={detail}
                    favorite={favorite}
                    onToggleFavorite={() => handleToggleFavorite(detail)}
                    onOpenSheet={openSheet}
                />
            ) : (
                <SectionBar
                    anchors={anchors}
                    activeId={activeId}
                    onNavigate={scrollToSection}
                    favorite={favorite}
                    onToggleFavorite={() => handleToggleFavorite(detail)}
                    onShare={handleShare}
                />
            )}

            <div className="estd-content">
                <div className="ui-container estd-layout">
                    <div className="estd-main">
                        {hasAbout && <AboutSection detail={detail} />}
                        {hasAddress && (
                            <DirectionsSection detail={detail} links={links} isMobile={isMobile} onOpenSheet={openSheet} />
                        )}
                        <ReviewsSection spotId={detail.id} spotName={detail.name} />
                    </div>
                    <ContactCard detail={detail} onGoToDirections={() => scrollToSection("como-chegar")} />
                </div>
            </div>

            {nearby.length > 0 && (
                <NearbySection
                    items={nearby}
                    lodging={detail.apiType === "hostpoint"}
                    favoriteIds={favoriteIds}
                    onToggleFavorite={handleToggleFavorite}
                />
            )}

            <ClaimSection detail={detail} />

            {isMobile && <BottomBar detail={detail} onOpenSheet={openSheet} />}

            {galleryIndex !== null && (
                <PhotoLightbox
                    title={detail.name}
                    photos={detail.photos}
                    index={galleryIndex}
                    onIndexChange={setGalleryIndex}
                    onClose={() => setGalleryIndex(null)}
                    returnFocusRef={openerRef}
                />
            )}

            {sheetOpen && (
                <DirectionsSheet
                    address={detail.address}
                    links={links}
                    onClose={() => setSheetOpen(false)}
                    returnFocusRef={openerRef}
                />
            )}

            <div className={`estd-toast${toast ? " estd-toast--on" : ""}`} role="status" aria-live="polite">
                {toast}
            </div>
        </>
    );
}

function StateScreen({ children }: { children: ReactNode }) {
    return (
        <>
            <PageHero breadcrumb={[{ label: "Início", to: "/" }, { label: "Estabelecimentos", to: "/estabelecimentos" }]} title="Estabelecimento" />
            <div className="ui-container estd-state">{children}</div>
        </>
    );
}

export default function Estabelecimento() {
    const { id = "" } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const preferred = parseApiType(searchParams.get("apiType"));
    const [attempt, setAttempt] = useState(0);
    const [loaded, setLoaded] = useState<{ key: string; result: DetailLoadResult } | null>(null);

    const requestKey = `${id}|${preferred ?? ""}|${attempt}`;
    const result = loaded?.key === requestKey ? loaded.result : null;
    const isMobile = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        let cancelled = false;
        loadEstablishmentDetail(id, preferred).then((value) => {
            if (!cancelled) setLoaded({ key: requestKey, result: value });
        });
        return () => {
            cancelled = true;
        };
    }, [id, preferred, requestKey]);

    const ready = result?.status === "ready" ? result.data : null;
    const hasBottomBar = isMobile && ready !== null && (ready.address !== "" || telHref(ready.phone) !== "" || ready.avgPrice !== "");

    return (
        <div className={`estd-page${hasBottomBar ? " estd-page--bar" : ""}`}>
            <Header />
            <main className="estd-main-wrap" id="conteudo" tabIndex={-1}>
                {result === null && <DetailSkeleton />}
                {result?.status === "ready" && <DetailView key={result.data.id} detail={result.data} />}
                {result?.status === "not-found" && (
                    <StateScreen>
                        <StateBlock
                            variant="empty"
                            icon="search_off"
                            title="Não encontramos este estabelecimento"
                            actions={
                                <ButtonLink to="/estabelecimentos" large>
                                    Ver todos os estabelecimentos
                                </ButtonLink>
                            }
                        >
                            O endereço pode ter mudado ou o cadastro foi removido.
                        </StateBlock>
                    </StateScreen>
                )}
                {result?.status === "error" && (
                    <StateScreen>
                        <StateBlock
                            variant="error"
                            icon="wifi_off"
                            title="Não conseguimos carregar este estabelecimento"
                            actions={
                                <Button large icon="refresh" onClick={() => setAttempt((n) => n + 1)}>
                                    Tentar de novo
                                </Button>
                            }
                        >
                            A conexão na serra pode oscilar. Verifique o sinal e tente de novo.
                        </StateBlock>
                    </StateScreen>
                )}
            </main>
            <Footer />
        </div>
    );
}
