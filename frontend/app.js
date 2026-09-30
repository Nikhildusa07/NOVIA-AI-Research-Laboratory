/* =========================================================
   NOVIA — AI RESEARCH LABORATORY
   Complete frontend application
========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = "https://novia-ai-research-laboratory.onrender.com";


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    currentPage: "research",

    researchData: null,

    selectedCycle: 0,

    selectedNodeId: null,

    graphScale: 1,

    graphOffsetX: 0,

    graphOffsetY: 0,

    graphNodes: [],

    graphRelationships: [],

    graphPositions: new Map(),

    backendOnline: false

};


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeApplication();
    }
);


async function initializeApplication() {

    setupNavigation();

    setupKeyboardShortcuts();

    await checkBackendStatus();

    loadStoredResearch();

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    const page =
                        item.dataset.page;

                    if (page) {
                        navigate(page);
                    }

                }
            );

        }
    );

}


function navigate(page) {

    const validPages = [
        "research",
        "results",
        "graph",
        "literature"
    ];

    if (!validPages.includes(page)) {
        return;
    }

    state.currentPage = page;

    document
        .querySelectorAll(".page")
        .forEach(
            section => {

                section.classList.remove(
                    "active-page"
                );

            }
        );

    const target =
        document.getElementById(
            `page-${page}`
        );

    if (target) {

        target.classList.add(
            "active-page"
        );

    }

    document
        .querySelectorAll(".nav-item")
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page === page
                );

            }
        );

    closeSidebar();

    if (page === "results") {
        renderResults();
    }

    if (page === "graph") {
        renderKnowledgeGraph();
    }

    if (page === "literature") {
        renderLiterature();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeSourceModal();

                closeSidebar();

            }

        }
    );

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "mobileOverlay"
        );

    if (!sidebar || !overlay) {
        return;
    }

    sidebar.classList.toggle("open");

    overlay.classList.toggle(
        "active"
    );

}


function closeSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "mobileOverlay"
        );

    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

}


/* =========================================================
   BACKEND STATUS
========================================================= */

async function checkBackendStatus() {

    const statusText =
        document.getElementById(
            "systemStatusText"
        );

    const mobileDot =
        document.getElementById(
            "mobileStatusDot"
        );

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/`,
                {
                    method: "GET"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Backend unavailable"
            );
        }

        state.backendOnline = true;

        if (statusText) {

            statusText.textContent =
                "System Operational";

        }

        if (mobileDot) {

            mobileDot.style.background =
                "var(--green)";

        }

    }
    catch (error) {

        state.backendOnline = false;

        if (statusText) {

            statusText.textContent =
                "Backend Offline";

        }

        if (mobileDot) {

            mobileDot.style.background =
                "var(--red)";

        }

    }

}


/* =========================================================
   START RESEARCH
========================================================= */

async function startResearch() {

    const questionElement =
        document.getElementById(
            "researchQuestion"
        );

    const datasetElement =
        document.getElementById(
            "datasetType"
        );

    const cyclesElement =
        document.getElementById(
            "maxCycles"
        );

    const button =
        document.getElementById(
            "startResearchButton"
        );

    if (!questionElement || !datasetElement) {
        return;
    }

    const question =
        questionElement.value.trim();

    const datasetType =
        datasetElement.value;

    const maxCycles =
        cyclesElement
            ? Number(cyclesElement.value)
            : 3;

    if (!question) {

        showResearchError(
            "Please enter a research question."
        );

        return;

    }

    hideResearchError();

    if (button) {
        button.disabled = true;
    }

    showLoading();

    try {

        const query =
            new URLSearchParams();

        query.set(
            "research_question",
            question
        );

        query.set(
            "dataset_type",
            datasetType
        );

        query.set(
            "max_cycles",
            String(maxCycles)
        );

        const response =
            await fetch(
                `${API_BASE_URL}/research?${query.toString()}`,
                {
                    method: "POST",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );

        if (!response.ok) {

            let message =
                `Research request failed (${response.status})`;

            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {

                    message =
                        typeof errorData.detail === "string"
                            ? errorData.detail
                            : JSON.stringify(
                                errorData.detail
                            );

                }

            }
            catch (error) {
                /* Ignore JSON parsing errors. */
            }

            throw new Error(message);

        }

        const data =
            await response.json();

        state.researchData =
            data;

        state.selectedCycle = 0;

        state.selectedNodeId = null;

        saveResearch(data);

        renderResults();

        renderLiterature();

        renderKnowledgeGraph();

        hideLoading();

        navigate("results");

    }
    catch (error) {

        hideLoading();

        showResearchError(
            error.message ||
            "Failed to connect to NOVIA backend."
        );

    }
    finally {

        if (button) {
            button.disabled = false;
        }

    }

}


/* =========================================================
   LOADING
========================================================= */

let loadingTimer = null;


function showLoading() {

    const overlay =
        document.getElementById(
            "loadingOverlay"
        );

    if (!overlay) {
        return;
    }

    overlay.classList.remove(
        "hidden"
    );

    const messages = [
        "Retrieving scientific literature...",
        "Generating research hypotheses...",
        "Executing machine learning experiments...",
        "Performing statistical evaluation...",
        "Running independent verification...",
        "Generating the next research cycle..."
    ];

    let index = 0;

    updateLoadingMessage(
        messages[index]
    );

    setLoadingStep(1);

    loadingTimer =
        setInterval(
            () => {

                index =
                    Math.min(
                        index + 1,
                        messages.length - 1
                    );

                updateLoadingMessage(
                    messages[index]
                );

                setLoadingStep(
                    Math.min(
                        index + 1,
                        5
                    )
                );

            },
            1600
        );

}


function hideLoading() {

    const overlay =
        document.getElementById(
            "loadingOverlay"
        );

    if (overlay) {

        overlay.classList.add(
            "hidden"
        );

    }

    if (loadingTimer) {

        clearInterval(
            loadingTimer
        );

        loadingTimer = null;

    }

}


function updateLoadingMessage(message) {

    const element =
        document.getElementById(
            "loadingMessage"
        );

    if (element) {

        element.textContent =
            message;

    }

}


function setLoadingStep(step) {

    document
        .querySelectorAll(
            ".loading-steps span"
        )
        .forEach(
            (element, index) => {

                element.classList.toggle(
                    "active",
                    index < step
                );

            }
        );

}


/* =========================================================
   ERRORS
========================================================= */

function showResearchError(message) {

    const card =
        document.getElementById(
            "researchError"
        );

    const messageElement =
        document.getElementById(
            "researchErrorMessage"
        );

    if (!card || !messageElement) {
        return;
    }

    messageElement.textContent =
        message;

    card.classList.remove(
        "hidden"
    );

}


function hideResearchError() {

    const card =
        document.getElementById(
            "researchError"
        );

    if (!card) {
        return;
    }

    card.classList.add(
        "hidden"
    );

}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function saveResearch(data) {

    try {

        localStorage.setItem(
            "novia_latest_research",
            JSON.stringify(data)
        );

    }
    catch (error) {

        console.warn(
            "Unable to save research:",
            error
        );

    }

}


function loadStoredResearch() {

    try {

        const stored =
            localStorage.getItem(
                "novia_latest_research"
            );

        if (!stored) {
            return;
        }

        const data =
            JSON.parse(stored);

        if (
            data &&
            Array.isArray(data.cycles)
        ) {

            state.researchData =
                data;

            renderResults();

            renderLiterature();

            renderKnowledgeGraph();

        }

    }
    catch (error) {

        console.warn(
            "Unable to restore research:",
            error
        );

    }

}


/* =========================================================
   RESULTS
========================================================= */

function renderResults() {

    const empty =
        document.getElementById(
            "resultsEmpty"
        );

    const content =
        document.getElementById(
            "resultsContent"
        );

    if (!empty || !content) {
        return;
    }

    if (
        !state.researchData ||
        !Array.isArray(
            state.researchData.cycles
        )
    ) {

        empty.classList.remove(
            "hidden"
        );

        content.classList.add(
            "hidden"
        );

        return;

    }

    empty.classList.add(
        "hidden"
    );

    content.classList.remove(
        "hidden"
    );

    const data =
        state.researchData;

    const project =
        data.research_project || {};

    const cycles =
        data.cycles || [];

    const literature =
        data.literature_research?.results ||
        [];

    const questionElement =
        document.getElementById(
            "resultsQuestion"
        );

    if (questionElement) {

        questionElement.textContent =
            project.research_question ||
            "";

    }

    const researchId =
        document.getElementById(
            "metricResearchId"
        );

    if (researchId) {

        researchId.textContent =
            project.id ?? "—";

    }

    const cycleMetric =
        document.getElementById(
            "metricCycles"
        );

    if (cycleMetric) {

        cycleMetric.textContent =
            cycles.length;

    }

    const sourceMetric =
        document.getElementById(
            "metricSources"
        );

    if (sourceMetric) {

        sourceMetric.textContent =
            literature.length;

    }

    const datasetMetric =
        document.getElementById(
            "metricDataset"
        );

    if (datasetMetric) {

        datasetMetric.textContent =
            data.dataset_generation?.dataset_name ||
            cycles[0]?.execution?.dataset ||
            "—";

    }

    const cycleBadge =
        document.getElementById(
            "cycleBadge"
        );

    if (cycleBadge) {

        cycleBadge.textContent =
            `${cycles.length} / ${
                data.max_cycles || cycles.length
            } cycles completed`;

    }

    renderCycleTabs(cycles);

    renderCycles(cycles);

}


function renderCycleTabs(cycles) {

    const container =
        document.getElementById(
            "cycleTabs"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    cycles.forEach(
        (cycle, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "cycle-tab";

            button.textContent =
                `Cycle ${
                    cycle.cycle ||
                    index + 1
                }`;

            if (
                index ===
                state.selectedCycle
            ) {

                button.classList.add(
                    "active"
                );

            }

            button.onclick =
                () => {

                    state.selectedCycle =
                        index;

                    renderCycleTabs(
                        cycles
                    );

                    scrollToCycle(
                        index
                    );

                };

            container.appendChild(
                button
            );

        }
    );

}


function scrollToCycle(index) {

    const element =
        document.getElementById(
            `cycle-${index}`
        );

    if (!element) {
        return;
    }

    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


function renderCycles(cycles) {

    const container =
        document.getElementById(
            "cyclesContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    cycles.forEach(
        (cycle, index) => {

            const card =
                createCycleCard(
                    cycle,
                    index
                );

            container.appendChild(
                card
            );

        }
    );

}


function createCycleCard(cycle, index) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "cycle-card";

    card.id =
        `cycle-${index}`;

    const verification =
        cycle.verification || {};

    const passed =
        Boolean(
            verification.verification_passed
        );

    const header =
        document.createElement(
            "button"
        );

    header.className =
        "cycle-header";

    header.innerHTML = `
        <span class="cycle-title">
            <span class="collapse-icon">⌄</span>
            Research Cycle ${
                escapeHtml(
                    String(
                        cycle.cycle ||
                        index + 1
                    )
                )
            }
        </span>

        <span class="verification-pill ${
            passed ? "" : "failed"
        }">
            ${
                passed
                    ? "✓ VERIFIED"
                    : "✕ FAILED"
            }
        </span>
    `;

    const body =
        document.createElement(
            "div"
        );

    body.className =
        "cycle-body";

    body.innerHTML =
        createCycleBodyHTML(
            cycle
        );

    header.onclick =
        () => {

            card.classList.toggle(
                "collapsed"
            );

        };

    card.appendChild(
        header
    );

    card.appendChild(
        body
    );

    return card;

}


/* =========================================================
   CYCLE HTML
========================================================= */

function createCycleBodyHTML(cycle) {

    const hypothesis =
        cycle.hypothesis || {};

    const experiment =
        cycle.experiment || {};

    const execution =
        cycle.execution || {};

    const analysis =
        cycle.analysis || {};

    const statistics =
        cycle.statistical_evaluation ||
        null;

    const debate =
        cycle.agent_debate || {};

    const verification =
        cycle.verification || {};

    const failure =
        cycle.failure_analysis || {};

    const report =
        cycle.report || {};

    const models =
        execution.models || {};

    const findings =
        Array.isArray(
            analysis.findings
        )
            ? analysis.findings
            : [];

    const reproducibility =
        experiment.reproducibility ||
        execution.reproducibility ||
        {};

    let html = "";


    /* -------------------------------------------------------
       HYPOTHESIS
    -------------------------------------------------------- */

    html += `
        <section class="subsection">

            <div class="subsection-title">
                Hypothesis
            </div>

            <div class="hypothesis-box">
                ${escapeHtml(
                    hypothesis.hypothesis ||
                    "No hypothesis available."
                )}
            </div>

        </section>
    `;


    /* -------------------------------------------------------
       EXPERIMENT
    -------------------------------------------------------- */

    html += `
        <section class="subsection">

            <div class="subsection-title">
                Experiment
            </div>

            <div class="info-grid">

                <div class="info-card">

                    <div class="info-card-label">
                        Experiment
                    </div>

                    <div class="info-card-value">
                        ID:
                        ${escapeHtml(
                            String(
                                experiment.id ??
                                "—"
                            )
                        )}

                        <br>

                        Version:
                        ${escapeHtml(
                            String(
                                experiment.version ??
                                "—"
                            )
                        )}
                    </div>

                </div>


                <div class="info-card">

                    <div class="info-card-label">
                        Dataset
                    </div>

                    <div class="info-card-value">
                        ${escapeHtml(
                            execution.dataset ||
                            "—"
                        )}
                    </div>

                </div>

            </div>

        </section>
    `;


    /* -------------------------------------------------------
       MODEL COMPARISON
    -------------------------------------------------------- */

    const modelNames =
        Object.keys(models);

    if (modelNames.length) {

        html += `
            <section class="subsection">

                <div class="subsection-title">
                    Model Comparison
                </div>

                <div class="table-wrapper">

                    <table class="model-table">

                        <thead>

                            <tr>
                                <th>Model</th>
                                <th>MAE</th>
                                <th>RMSE</th>
                                <th>R²</th>
                            </tr>

                        </thead>

                        <tbody>
        `;

        const bestModel =
            analysis.best_model_by_r2;

        modelNames.forEach(
            name => {

                const metrics =
                    models[name] || {};

                const isBest =
                    name === bestModel;

                html += `
                    <tr class="${
                        isBest
                            ? "best-model"
                            : ""
                    }">

                        <td>
                            ${escapeHtml(name)}
                        </td>

                        <td>
                            ${formatNumber(
                                metrics.MAE
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                metrics.RMSE
                            )}
                        </td>

                        <td>
                            ${formatNumber(
                                metrics.R2
                            )}
                        </td>

                    </tr>
                `;

            }
        );

        html += `
                        </tbody>

                    </table>

                </div>

            </section>
        `;

    }


    /* -------------------------------------------------------
       ANALYSIS
    -------------------------------------------------------- */

    html += `
        <section class="subsection">

            <div class="subsection-title">
                Analysis Findings
            </div>

            <ul class="findings">
                ${
                    findings.length
                        ? findings
                            .map(
                                item =>
                                    `<li>${escapeHtml(
                                        item
                                    )}</li>`
                            )
                            .join("")
                        : "<li>No findings available.</li>"
                }
            </ul>

        </section>
    `;


    /* -------------------------------------------------------
       STATISTICS
    -------------------------------------------------------- */

    if (statistics) {

        const significant =
            Boolean(
                statistics.statistically_significant
            );

        html += `
            <section class="subsection">

                <div class="subsection-title">
                    Statistical Evaluation
                </div>

                <div class="statistics-grid">

                    <div class="stat-card">

                        <span>
                            Test
                        </span>

                        <strong>
                            ${escapeHtml(
                                statistics.test ||
                                "—"
                            )}
                        </strong>

                    </div>


                    <div class="stat-card">

                        <span>
                            P-Value
                        </span>

                        <strong>
                            ${formatNumber(
                                statistics.p_value
                            )}
                        </strong>

                    </div>


                    <div class="stat-card">

                        <span>
                            Alpha
                        </span>

                        <strong>
                            ${formatNumber(
                                statistics.alpha
                            )}
                        </strong>

                    </div>


                    <div class="stat-card">

                        <span>
                            Result
                        </span>

                        <strong class="${
                            significant
                                ? "stat-significant"
                                : "stat-not-significant"
                        }">
                            ${
                                significant
                                    ? "Statistically Significant"
                                    : "Not Statistically Significant"
                            }
                        </strong>

                    </div>

                </div>


                <div class="interpretation">

                    ${escapeHtml(
                        statistics.interpretation ||
                        "No interpretation available."
                    )}

                </div>

            </section>
        `;

    }


    /* -------------------------------------------------------
       AGENT DEBATE
    -------------------------------------------------------- */

    if (debate && debate.researcher) {

        html += `
            <section class="subsection">

                <div class="subsection-title">
                    Agent Debate
                </div>

                <div class="debate-grid">

                    <div class="debate-card">

                        <div class="debate-role">
                            Researcher Agent
                        </div>

                        <div class="debate-text">
                            ${escapeHtml(
                                debate.researcher.argument ||
                                "No argument available."
                            )}
                        </div>

                    </div>


                    <div class="debate-card">

                        <div class="debate-role">
                            Critic Agent
                        </div>

                        <div class="debate-text">
                            ${escapeHtml(
                                debate.critic?.argument ||
                                "No critique available."
                            )}
                        </div>

                    </div>

                </div>


                <div class="debate-conclusion">

                    ${escapeHtml(
                        debate.debate_conclusion ||
                        "No debate conclusion available."
                    )}

                </div>

            </section>
        `;

    }


    /* -------------------------------------------------------
       VERIFICATION
    -------------------------------------------------------- */

    html += `
        <section class="subsection">

            <div class="subsection-title">
                Independent Verification
            </div>

            <div class="info-grid">

                <div class="info-card">

                    <div class="info-card-label">
                        Status
                    </div>

                    <div class="info-card-value">

                        ${
                            verification.verification_passed
                                ? "Verification Passed"
                                : "Verification Failed"
                        }

                    </div>

                </div>


                <div class="info-card">

                    <div class="info-card-label">
                        Verified Model
                    </div>

                    <div class="info-card-value">

                        ${escapeHtml(
                            verification.verified_model ||
                            "—"
                        )}

                    </div>

                </div>

            </div>

        </section>
    `;


    /* -------------------------------------------------------
       FAILURE ANALYSIS
    -------------------------------------------------------- */

    const issues =
        Array.isArray(
            failure.identified_issues
        )
            ? failure.identified_issues
            : [];

    html += `
        <section class="subsection">

            <div class="subsection-title">
                Failure Analysis & Limitations
            </div>

            <div class="failure-status">

                Status

                <strong>
                    ${escapeHtml(
                        failure.experiment_status ||
                        "successful"
                    )}
                </strong>

            </div>
    `;

    if (issues.length) {

        html += `
            <ul class="failure-list">
                ${issues
                    .map(
                        issue =>
                            `<li>${escapeHtml(
                                issue
                            )}</li>`
                    )
                    .join("")}
            </ul>
        `;

    }

    if (
        failure.recommended_next_action ||
        failure.next_experiment
    ) {

        html += `
            <div class="recommendation">

                <strong>
                    NEXT ACTION:
                </strong>

                <br><br>

                ${escapeHtml(
                    failure.recommended_next_action ||
                    failure.next_experiment ||
                    ""
                )}

            </div>
        `;

    }

    html += `
        </section>
    `;


    /* -------------------------------------------------------
       REPRODUCIBILITY
    -------------------------------------------------------- */

    if (
        reproducibility &&
        Object.keys(reproducibility).length
    ) {

        const modelConfig =
            reproducibility.model_config ||
            {};

        html += `
            <section class="subsection">

                <div class="subsection-title">
                    Experiment Reproducibility
                </div>

                <div class="repro-grid">

                    <div class="repro-card">

                        <span>
                            Random State
                        </span>

                        <strong>
                            ${escapeHtml(
                                String(
                                    reproducibility.random_state ??
                                    "—"
                                )
                            )}
                        </strong>

                    </div>


                    <div class="repro-card">

                        <span>
                            Test Size
                        </span>

                        <strong>
                            ${escapeHtml(
                                String(
                                    reproducibility.test_size ??
                                    "—"
                                )
                            )}
                        </strong>

                    </div>


                    <div class="repro-card">

                        <span>
                            Dataset
                        </span>

                        <strong>
                            ${escapeHtml(
                                String(
                                    reproducibility.dataset ??
                                    execution.dataset ??
                                    "—"
                                )
                            )}
                        </strong>

                    </div>


                    <div class="repro-card">

                        <span>
                            Model Configuration
                        </span>

                        <strong>
                            ${escapeHtml(
                                Object.keys(
                                    modelConfig
                                ).join(", ") ||
                                "—"
                            )}
                        </strong>

                    </div>

                </div>

            </section>
        `;

    }


    /* -------------------------------------------------------
       REPORT
    -------------------------------------------------------- */

    html += `
        <section class="subsection">

            <div class="subsection-title">
                Research Report
            </div>

            <div class="conclusion-box">

                ${escapeHtml(
                    report.conclusion ||
                    "No report generated."
                )}

            </div>

        </section>
    `;


    return html;

}


/* =========================================================
   LITERATURE
========================================================= */

function renderLiterature() {

    const container =
        document.getElementById(
            "literatureContainer"
        );

    const count =
        document.getElementById(
            "literatureCount"
        );

    if (!container || !count) {
        return;
    }

    const results =
        state.researchData
            ?.literature_research
            ?.results || [];

    count.textContent =
        `${results.length} Source${
            results.length === 1
                ? ""
                : "s"
        }`;

    if (!results.length) {

        container.innerHTML = `
            <div class="empty-state compact">

                <div class="empty-icon">
                    ▤
                </div>

                <h3>
                    No Literature Available
                </h3>

                <p>
                    Run a research session to retrieve
                    external sources.
                </p>

            </div>
        `;

        return;

    }

    container.innerHTML = "";

    results.forEach(
        (source, index) => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "literature-card";

            const title =
                source.title ||
                `Research Source ${index + 1}`;

            const content =
                source.content ||
                "No source summary available.";

            const summary =
                cleanLiteratureText(
                    content
                );

            card.innerHTML = `
                <div class="source-number">
                    SOURCE ${
                        String(
                            index + 1
                        ).padStart(2, "0")
                    }
                </div>

                <h3>
                    ${escapeHtml(title)}
                </h3>

                <div class="literature-summary">
                    ${escapeHtml(summary)}
                </div>

                <div class="literature-actions">

                    <button
                        class="text-button"
                        onclick="openSourceModal(${index})"
                    >
                        View Details →
                    </button>

                    ${
                        source.url
                            ? `
                                <a
                                    class="text-button"
                                    href="${escapeAttribute(
                                        source.url
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open Source ↗
                                </a>
                            `
                            : ""
                    }

                </div>
            `;

            container.appendChild(
                card
            );

        }
    );

}


function cleanLiteratureText(text) {

    return String(text)
        .replace(
            /\\\n/g,
            " "
        )
        .replace(
            /\n+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


function openSourceModal(index) {

    const source =
        state.researchData
            ?.literature_research
            ?.results?.[index];

    if (!source) {
        return;
    }

    const title =
        document.getElementById(
            "modalSourceTitle"
        );

    const content =
        document.getElementById(
            "modalSourceContent"
        );

    const link =
        document.getElementById(
            "modalSourceLink"
        );

    const modal =
        document.getElementById(
            "sourceModal"
        );

    if (title) {

        title.textContent =
            source.title ||
            `Source ${index + 1}`;

    }

    if (content) {

        content.textContent =
            source.content ||
            "No content available.";

    }

    if (link) {

        if (source.url) {

            link.href =
                source.url;

            link.classList.remove(
                "hidden"
            );

        }
        else {

            link.classList.add(
                "hidden"
            );

        }

    }

    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


function closeSourceModal() {

    const modal =
        document.getElementById(
            "sourceModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   KNOWLEDGE GRAPH
========================================================= */

function renderKnowledgeGraph() {

    const svg =
        document.getElementById(
            "knowledgeGraph"
        );

    const nodesGroup =
        document.getElementById(
            "graphNodes"
        );

    const relationshipsGroup =
        document.getElementById(
            "graphRelationships"
        );

    const empty =
        document.getElementById(
            "graphEmpty"
        );

    if (
        !svg ||
        !nodesGroup ||
        !relationshipsGroup
    ) {
        return;
    }

    const graph =
        state.researchData
            ?.knowledge_graph;

    if (
        !graph ||
        !Array.isArray(graph.nodes) ||
        !graph.nodes.length
    ) {

        nodesGroup.innerHTML = "";

        relationshipsGroup.innerHTML = "";

        if (empty) {
            empty.classList.remove("hidden");
        }

        return;

    }

    if (empty) {
        empty.classList.add("hidden");
    }

    state.graphNodes =
        graph.nodes;

    state.graphRelationships =
        Array.isArray(graph.relationships)
            ? graph.relationships
            : [];

    calculateGraphPositions();

    drawGraph();

}


/* =========================================================
   IMPROVED GRAPH POSITIONING
   Research pipeline / layered layout
========================================================= */

function calculateGraphPositions() {

    const nodes =
        state.graphNodes || [];

    /*
        Larger virtual canvas prevents overlap.

        Flow:

        Research
             ↓
        Evidence
             ↓
        Hypothesis
             ↓
        Experiment
             ↓
        Models
             ↓
        Analysis
             ↓
        Statistics
             ↓
        Debate
             ↓
        Verification
             ↓
        Failure Analysis
             ↓
        Report
    */

    const width = 1200;

    const height = 720;

    state.graphPositions.clear();

    if (!nodes.length) {
        return;
    }


    /* -------------------------------------------------------
       Layer configuration
    -------------------------------------------------------- */

    const layerOrder = [

        "research_question",

        "literature_source",
        "dataset",

        "hypothesis",

        "experiment",

        "model",

        "analysis",

        "statistical_evaluation",

        "agent_debate",

        "verification",

        "failure_analysis",

        "report",

        "reproducibility"

    ];


    const layers = new Map();

    layerOrder.forEach(
        type => {
            layers.set(type, []);
        }
    );


    const unknownNodes = [];


    nodes.forEach(
        node => {

            const type =
                node.type ||
                "unknown";

            if (layers.has(type)) {

                layers
                    .get(type)
                    .push(node);

            }
            else {

                unknownNodes.push(node);

            }

        }
    );


    if (unknownNodes.length) {

        layers.set(
            "unknown",
            unknownNodes
        );

        layerOrder.push(
            "unknown"
        );

    }


    const activeLayers =
        layerOrder.filter(
            type =>
                layers.has(type) &&
                layers.get(type).length > 0
        );


    /*
        Keep the graph readable.

        Minimum x spacing:
        approximately 92px.

        With 13 layers:
        1200px canvas is enough.
    */

    const leftMargin = 65;

    const rightMargin = 65;

    const usableWidth =
        width -
        leftMargin -
        rightMargin;

    const columnStep =
        activeLayers.length <= 1
            ? 0
            : usableWidth /
                (activeLayers.length - 1);


    activeLayers.forEach(
        (type, layerIndex) => {

            const layerNodes =
                layers.get(type);

            const x =
                activeLayers.length === 1
                    ? width / 2
                    : leftMargin +
                        columnStep *
                        layerIndex;


            /*
                Vertical spacing is calculated
                independently for every column.
            */

            const count =
                layerNodes.length;

            const maxSpacing = 82;

            const minSpacing = 58;

            let spacing =
                maxSpacing;

            if (count > 1) {

                spacing =
                    Math.min(
                        maxSpacing,
                        Math.max(
                            minSpacing,
                            (height - 120) /
                            (count - 1)
                        )
                    );

            }


            const totalHeight =
                (count - 1) *
                spacing;


            const startY =
                (height / 2) -
                (totalHeight / 2);


            layerNodes.forEach(
                (node, index) => {

                    const y =
                        count === 1
                            ? height / 2
                            : startY +
                                index *
                                spacing;

                    state.graphPositions.set(
                        node.id,
                        {
                            x,
                            y
                        }
                    );

                }
            );

        }
    );


    /*
        Special adjustment for evidence nodes.

        Literature and dataset nodes should
        sit slightly apart so they are readable.
    */

    const evidenceNodes =
        [
            ...(layers.get("literature_source") || []),
            ...(layers.get("dataset") || [])
        ];

    if (evidenceNodes.length) {

        const evidenceX =
            state.graphPositions.get(
                evidenceNodes[0].id
            )?.x;

        if (evidenceX !== undefined) {

            const spacing = 95;

            const start =
                (height / 2) -
                ((evidenceNodes.length - 1) *
                    spacing) /
                2;

            evidenceNodes.forEach(
                (node, index) => {

                    state.graphPositions.set(
                        node.id,
                        {
                            x: evidenceX,
                            y: start +
                                index *
                                spacing
                        }
                    );

                }
            );

        }

    }

}


/* =========================================================
   DRAW GRAPH
========================================================= */

function drawGraph() {

    const nodesGroup =
        document.getElementById(
            "graphNodes"
        );

    const relationshipsGroup =
        document.getElementById(
            "graphRelationships"
        );

    const viewport =
        document.getElementById(
            "graphViewport"
        );

    const svg =
        document.getElementById(
            "knowledgeGraph"
        );

    if (
        !nodesGroup ||
        !relationshipsGroup ||
        !viewport ||
        !svg
    ) {
        return;
    }


    /*
        Use larger virtual canvas.
    */

    svg.setAttribute(
        "viewBox",
        "0 0 1200 720"
    );


    nodesGroup.innerHTML = "";

    relationshipsGroup.innerHTML = "";


    viewport.setAttribute(
        "transform",
        `translate(
            ${state.graphOffsetX}
            ${state.graphOffsetY}
        )
        scale(${state.graphScale})`
    );


    /* -------------------------------------------------------
       EDGES
    -------------------------------------------------------- */

    state.graphRelationships.forEach(
        relationship => {

            const source =
                state.graphPositions.get(
                    relationship.source
                );

            const target =
                state.graphPositions.get(
                    relationship.target
                );

            if (!source || !target) {
                return;
            }

            const line =
                createSvgElement(
                    "line"
                );

            line.setAttribute(
                "x1",
                source.x
            );

            line.setAttribute(
                "y1",
                source.y
            );

            line.setAttribute(
                "x2",
                target.x
            );

            line.setAttribute(
                "y2",
                target.y
            );

            line.setAttribute(
                "class",
                "graph-edge"
            );

            relationshipsGroup.appendChild(
                line
            );

        }
    );


    /* -------------------------------------------------------
       NODES
    -------------------------------------------------------- */

    state.graphNodes.forEach(
        node => {

            const position =
                state.graphPositions.get(
                    node.id
                );

            if (!position) {
                return;
            }

            const group =
                createSvgElement(
                    "g"
                );

            const selected =
                state.selectedNodeId ===
                node.id;

            group.setAttribute(
                "class",
                `graph-node node-${sanitizeClass(
                    node.type
                )}${selected ? " selected" : ""}`
            );

            group.setAttribute(
                "transform",
                `translate(
                    ${position.x}
                    ${position.y}
                )`
            );

            group.dataset.nodeId =
                node.id;


            /* ------------------------------------------------
               NODE CIRCLE
            ------------------------------------------------- */

            const circle =
                createSvgElement(
                    "circle"
                );

            circle.setAttribute(
                "r",
                getNodeRadius(node)
            );

            group.appendChild(
                circle
            );


            /* ------------------------------------------------
               NODE LABEL
            ------------------------------------------------- */

            const label =
                createSvgElement(
                    "text"
                );

            label.setAttribute(
                "y",
                getNodeRadius(node) + 17
            );

            label.textContent =
                truncateText(
                    node.name ||
                    node.type ||
                    "Node",
                    22
                );

            group.appendChild(
                label
            );


            /* ------------------------------------------------
               CLICK
            ------------------------------------------------- */

            group.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    selectGraphNode(
                        node.id
                    );

                }
            );


            nodesGroup.appendChild(
                group
            );

        }
    );

}


function createSvgElement(tag) {

    return document.createElementNS(
        "http://www.w3.org/2000/svg",
        tag
    );

}


function getNodeRadius(node) {

    const type =
        node.type;

    if (
        type === "research_question" ||
        type === "dataset"
    ) {

        return 18;

    }

    if (
        type === "experiment" ||
        type === "hypothesis"
    ) {

        return 16;

    }

    if (
        type === "model" ||
        type === "verification"
    ) {

        return 14;

    }

    return 13;

}


/* =========================================================
   GRAPH NODE DETAILS
========================================================= */

function selectGraphNode(nodeId) {

    state.selectedNodeId =
        nodeId;

    const node =
        state.graphNodes.find(
            item =>
                item.id === nodeId
        );

    if (!node) {
        return;
    }

    document
        .querySelectorAll(
            ".graph-node"
        )
        .forEach(
            element => {

                element.classList.toggle(
                    "selected",
                    element.dataset.nodeId ===
                    nodeId
                );

            }
        );

    renderGraphDetails(
        node
    );

}


function renderGraphDetails(node) {

    const title =
        document.getElementById(
            "graphDetailsTitle"
        );

    const content =
        document.getElementById(
            "graphDetailsContent"
        );

    if (!title || !content) {
        return;
    }

    title.textContent =
        node.name ||
        node.type ||
        "Node";


    const properties =
        node.properties || {};


    const related =
        state.graphRelationships.filter(
            relationship =>
                relationship.source ===
                    node.id ||
                relationship.target ===
                    node.id
        );


    let html = `
        <div class="detail-group">

            <div class="detail-group-title">
                Node Type
            </div>

            <div class="detail-row">

                <span class="detail-label">
                    Type
                </span>

                <span class="detail-value">
                    ${escapeHtml(
                        formatNodeType(
                            node.type
                        )
                    )}
                </span>

            </div>

            <div class="detail-row">

                <span class="detail-label">
                    Node ID
                </span>

                <span class="detail-value">
                    ${escapeHtml(
                        node.id
                    )}
                </span>

            </div>

        </div>
    `;


    const propertyEntries =
        Object.entries(
            properties
        );


    if (propertyEntries.length) {

        html += `
            <div class="detail-group">

                <div class="detail-group-title">
                    Properties
                </div>
        `;

        propertyEntries.forEach(
            ([key, value]) => {

                html += `
                    <div class="detail-row">

                        <span class="detail-label">
                            ${escapeHtml(
                                formatKey(
                                    key
                                )
                            )}
                        </span>

                        <span class="detail-value">
                            ${escapeHtml(
                                formatPropertyValue(
                                    value
                                )
                            )}
                        </span>

                    </div>
                `;

            }
        );

        html += `
            </div>
        `;

    }


    if (related.length) {

        html += `
            <div class="detail-group">

                <div class="detail-group-title">
                    Relationships
                </div>
        `;

        related.forEach(
            relationship => {

                const outgoing =
                    relationship.source ===
                    node.id;

                const otherId =
                    outgoing
                        ? relationship.target
                        : relationship.source;

                const otherNode =
                    state.graphNodes.find(
                        item =>
                            item.id ===
                            otherId
                    );

                html += `
                    <div class="relationship-item">

                        <div class="relationship-type">
                            ${escapeHtml(
                                relationship.relationship
                            )}
                        </div>

                        <div>
                            ${
                                outgoing
                                    ? "→ "
                                    : "← "
                            }

                            ${escapeHtml(
                                otherNode?.name ||
                                otherId
                            )}
                        </div>

                    </div>
                `;

            }
        );

        html += `
            </div>
        `;

    }


    content.innerHTML =
        html;

}


/* =========================================================
   GRAPH SEARCH
========================================================= */

function filterGraph() {

    const input =
        document.getElementById(
            "graphSearch"
        );

    if (!input) {
        return;
    }

    const query =
        input.value
            .trim()
            .toLowerCase();


    document
        .querySelectorAll(
            ".graph-node"
        )
        .forEach(
            element => {

                const nodeId =
                    element.dataset.nodeId;

                const node =
                    state.graphNodes.find(
                        item =>
                            item.id ===
                            nodeId
                    );

                if (!node) {
                    return;
                }

                const text =
                    `${node.name || ""} ${
                        node.type || ""
                    } ${node.id || ""}`
                        .toLowerCase();

                const matches =
                    Boolean(
                        query &&
                        text.includes(query)
                    );

                element.classList.toggle(
                    "highlight",
                    matches
                );

            }
        );

}


/* =========================================================
   RESET GRAPH
========================================================= */

function resetGraph() {

    state.graphScale = 1;

    state.graphOffsetX = 0;

    state.graphOffsetY = 0;

    state.selectedNodeId =
        null;


    const search =
        document.getElementById(
            "graphSearch"
        );

    if (search) {
        search.value = "";
    }


    drawGraph();


    const details =
        document.getElementById(
            "graphDetailsContent"
        );

    if (details) {

        details.textContent =
            "Select a node in the graph to inspect its properties and relationships.";

    }


    const title =
        document.getElementById(
            "graphDetailsTitle"
        );

    if (title) {

        title.textContent =
            "Select a node";

    }

}


/* =========================================================
   GRAPH ZOOM
========================================================= */

function zoomGraph(factor) {

    state.graphScale *=
        factor;

    state.graphScale =
        Math.max(
            0.55,
            Math.min(
                2.5,
                state.graphScale
            )
        );

    drawGraph();

}


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function formatNumber(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "—";

    }

    const number =
        Number(value);

    if (!Number.isFinite(number)) {

        return escapeHtml(
            String(value)
        );

    }

    return number.toFixed(4);

}


function formatNodeType(type) {

    if (!type) {
        return "Unknown";
    }

    return String(type)
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );

}


function formatKey(key) {

    return String(key)
        .replace(
            /_/g,
            " "
        )
        .replace(
            /\b\w/g,
            character =>
                character.toUpperCase()
        );

}


function formatPropertyValue(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "—";

    }

    if (
        typeof value ===
        "object"
    ) {

        if (
            Array.isArray(value)
        ) {

            return value.join(
                ", "
            );

        }

        return Object.entries(
            value
        )
            .map(
                ([key, item]) =>
                    `${formatKey(
                        key
                    )}: ${
                        typeof item === "object"
                            ? JSON.stringify(
                                item
                            )
                            : item
                    }`
            )
            .join(
                " • "
            );

    }

    return String(value);

}


function truncateText(
    text,
    maxLength
) {

    const value =
        String(text || "");

    if (
        value.length <= maxLength
    ) {

        return value;

    }

    return (
        value.substring(
            0,
            maxLength - 1
        ) +
        "…"
    );

}


function sanitizeClass(value) {

    return String(
        value || "unknown"
    )
        .replace(
            /[^a-zA-Z0-9_-]/g,
            "_"
        );

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHtml(
        value
    );

}


/* =========================================================
   EXPORT FOR DEBUGGING
========================================================= */

window.NOVIA = {

    state,

    navigate,

    startResearch,

    renderResults,

    renderLiterature,

    renderKnowledgeGraph,

    resetGraph,

    zoomGraph,

    selectGraphNode

};