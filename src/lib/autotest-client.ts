import { randomizeAutoTest, type AutoTestTopic } from "./autotest-random";

type AutoTestPayload = {
    slug?: string;
    test?: AutoTestTopic;
    options?: {
        reshuffleOnReset?: boolean;
        scrollToReport?: boolean;
    };
};

type AutoTestDetail = {
    state: "correct" | "incorrect" | "unanswered";
    selectedIndex: number | null;
    correctIndex: number;
    isCorrect: boolean;
};

type SelectorConfig = {
    dataScript: string;
    form: string;
    questionsRoot: string;
    report: string;
    reportSummary: string;
    reportDetails: string;
    resetButton: string;
    questionCard: string;
};

export type InitAutotestClientOptions = {
    selectors?: Partial<SelectorConfig>;
    reshuffleOnReset?: boolean;
    scrollToReport?: boolean;
};

const DEFAULT_SELECTORS: SelectorConfig = {
    dataScript: "#autotest-data",
    form: "[data-autotest-form]",
    questionsRoot: "[data-questions-root]",
    report: "[data-report]",
    reportSummary: "[data-report-summary]",
    reportDetails: "[data-report-details]",
    resetButton: "[data-reset-button]",
    questionCard: "[data-question-card]",
};

function escapeHtml(value: unknown): string {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getFeedback(percent: number, passingScore: number) {
    if (percent >= 90) {
        return {
            label: "Excelente",
            message:
                "Dominás muy bien este tema. Podés seguir con el próximo o profundizar con ejercicios.",
        };
    }

    if (percent >= passingScore) {
        return {
            label: "Aprobado",
            message:
                "Buen trabajo. Tenés una base sólida, aunque todavía hay algunos puntos para reforzar.",
        };
    }

    if (percent >= 50) {
        return {
            label: "En proceso",
            message:
                "Vas bien, pero todavía conviene repasar antes de seguir avanzando.",
        };
    }

    return {
        label: "Repasar",
        message:
            "Conviene volver al tema, releer los conceptos y después repetir la autoevaluación.",
    };
}

function mergeSelectors(partial?: Partial<SelectorConfig>): SelectorConfig {
    return {
        ...DEFAULT_SELECTORS,
        ...partial,
    };
}

export function initAutotestClient(
    options: InitAutotestClientOptions = {},
): void {
    const start = () => {
        const selectors = mergeSelectors(options.selectors);

        const dataElement = document.querySelector(selectors.dataScript);
        const form = document.querySelector(selectors.form);
        const questionsRoot = document.querySelector(selectors.questionsRoot);
        const report = document.querySelector(selectors.report);
        const reportSummary = document.querySelector(selectors.reportSummary);
        const reportDetails = document.querySelector(selectors.reportDetails);
        const resetButton = document.querySelector(selectors.resetButton);

        if (
            !(dataElement instanceof HTMLScriptElement) ||
            !(form instanceof HTMLFormElement) ||
            !(questionsRoot instanceof HTMLElement) ||
            !(report instanceof HTMLElement) ||
            !(reportSummary instanceof HTMLElement) ||
            !(reportDetails instanceof HTMLElement) ||
            !(resetButton instanceof HTMLButtonElement)
        ) {
            return;
        }

        const dataElementEl: HTMLScriptElement = dataElement;
        const formEl: HTMLFormElement = form;
        const questionsRootEl: HTMLElement = questionsRoot;
        const reportEl: HTMLElement = report;
        const reportSummaryEl: HTMLElement = reportSummary;
        const reportDetailsEl: HTMLElement = reportDetails;
        const resetButtonEl: HTMLButtonElement = resetButton;

        let payload: AutoTestPayload;

        try {
            payload = JSON.parse(dataElementEl.textContent ?? "{}");
        } catch (error) {
            console.error(
                "No se pudo leer la configuración del autotest.",
                error,
            );
            return;
        }

        const originalTest = payload?.test;

        if (!originalTest || !Array.isArray(originalTest.questions)) {
            console.error("El autotest no tiene una estructura válida.");
            return;
        }

        let test = randomizeAutoTest(originalTest);

        const shouldReshuffleOnReset =
            options.reshuffleOnReset ??
            payload?.options?.reshuffleOnReset ??
            true;

        const shouldScrollToReport =
            options.scrollToReport ??
            payload?.options?.scrollToReport ??
            true;

        const passingScore =
            typeof originalTest.passingScore === "number"
                ? originalTest.passingScore
                : 70;

        function getQuestionCards(): HTMLElement[] {
            return Array.from(
                formEl.querySelectorAll<HTMLElement>(selectors.questionCard),
            );
        }

        function clearQuestionStates() {
            getQuestionCards().forEach((card) => {
                card.classList.remove(
                    "is-correct",
                    "is-incorrect",
                    "is-unanswered",
                );
            });
        }

        function hideReport() {
            reportEl.hidden = true;
            reportEl.setAttribute("hidden", "");
            reportSummaryEl.innerHTML = "";
            reportDetailsEl.innerHTML = "";
        }

        function renderQuestions() {
            questionsRootEl.innerHTML = test.questions
                .map((question, questionIndex) => {
                    const answersHtml = question.answers
                        .map((answer, answerIndex) => {
                            const inputId = `q-${questionIndex}-a-${answerIndex}`;

                            return `
                                <label class="autotest-option" for="${inputId}">
                                    <input
                                        id="${inputId}"
                                        type="radio"
                                        name="q-${questionIndex}"
                                        value="${String(answerIndex)}"
                                    />
                                    <span class="autotest-option__ui">
                                        <span
                                            class="autotest-option__marker"
                                            aria-hidden="true"
                                        ></span>
                                        <span>${escapeHtml(answer.text)}</span>
                                    </span>
                                </label>
                            `;
                        })
                        .join("");

                    return `
                        <fieldset
                            class="autotest-question card"
                            data-question-card
                            data-question-id="${escapeHtml(question.id)}"
                        >
                            <legend class="autotest-question__legend">
                                <span class="pill">
                                    Pregunta ${questionIndex + 1}
                                </span>
                                <h2>${escapeHtml(question.prompt)}</h2>
                            </legend>

                            <div class="autotest-options">
                                ${answersHtml}
                            </div>
                        </fieldset>
                    `;
                })
                .join("");
        }

        function renderSummary(result: {
            total: number;
            correctCount: number;
            answeredCount: number;
            percent: number;
        }) {
            const feedback = getFeedback(result.percent, passingScore);

            reportSummaryEl.innerHTML = `
                <div class="autotest-report__summary-top">
                    <span class="pill">${escapeHtml(feedback.label)}</span>
                    <h2>${result.percent}% de aciertos</h2>
                </div>

                <p>${escapeHtml(feedback.message)}</p>

                <div class="autotest-stats">
                    <div class="autotest-stat">
                        <strong>Correctas:</strong> ${result.correctCount} / ${result.total}
                    </div>
                    <div class="autotest-stat">
                        <strong>Respondidas:</strong> ${result.answeredCount} / ${result.total}
                    </div>
                    <div class="autotest-stat">
                        <strong>Objetivo:</strong> ${passingScore}%
                    </div>
                </div>
            `;
        }

        function renderDetails(details: AutoTestDetail[]) {
            reportDetailsEl.innerHTML = details
                .map((detail, index) => {
                    const question = test.questions[index];

                    const stateClass =
                        detail.state === "correct"
                            ? "autotest-result-card--correct"
                            : detail.state === "incorrect"
                                ? "autotest-result-card--incorrect"
                                : "autotest-result-card--unanswered";

                    const selectedText =
                        detail.selectedIndex === null
                            ? "Sin responder"
                            : (question.answers[detail.selectedIndex]?.text ??
                                "Sin responder");

                    const correctText =
                        question.answers[detail.correctIndex]?.text ??
                        "No configurada";

                    const explanation = question.explanation
                        ? `<p><strong>Explicación:</strong> ${escapeHtml(
                            question.explanation,
                        )}</p>`
                        : "";

                    return `
                        <article class="autotest-result-card ${stateClass}">
                            <h3>Pregunta ${index + 1}</h3>
                            <p><strong>Enunciado:</strong> ${escapeHtml(
                        question.prompt,
                    )}</p>
                            <p><strong>Tu respuesta:</strong> ${escapeHtml(selectedText)}</p>
                            <p><strong>Respuesta correcta:</strong> ${escapeHtml(correctText)}</p>
                            ${explanation}
                        </article>
                    `;
                })
                .join("");
        }

        function renderTest() {
            renderQuestions();
            clearQuestionStates();
            hideReport();
        }

        renderTest();

        formEl.addEventListener("submit", (event) => {
            event.preventDefault();

            clearQuestionStates();

            const formData = new FormData(formEl);
            const questionCards = getQuestionCards();

            const details: AutoTestDetail[] = test.questions.map(
                (question, questionIndex) => {
                    const rawSelected = formData.get(`q-${questionIndex}`);

                    const selectedIndex =
                        rawSelected === null ? null : Number(rawSelected);

                    const correctIndex = question.answers.findIndex(
                        (answer) => answer.isCorrect === true,
                    );

                    const isCorrect =
                        selectedIndex !== null &&
                        correctIndex !== -1 &&
                        selectedIndex === correctIndex;

                    const state =
                        selectedIndex === null
                            ? "unanswered"
                            : isCorrect
                                ? "correct"
                                : "incorrect";

                    const card = questionCards[questionIndex];

                    if (card) {
                        if (state === "correct") {
                            card.classList.add("is-correct");
                        } else if (state === "incorrect") {
                            card.classList.add("is-incorrect");
                        } else {
                            card.classList.add("is-unanswered");
                        }
                    }

                    return {
                        state,
                        selectedIndex,
                        correctIndex,
                        isCorrect,
                    };
                },
            );

            const total = test.questions.length;
            const correctCount = details.filter((item) => item.isCorrect).length;
            const answeredCount = details.filter(
                (item) => item.selectedIndex !== null,
            ).length;
            const percent =
                total === 0 ? 0 : Math.round((correctCount / total) * 100);

            renderSummary({
                total,
                correctCount,
                answeredCount,
                percent,
            });

            renderDetails(details);

            reportEl.hidden = false;
            reportEl.removeAttribute("hidden");

            if (shouldScrollToReport) {
                requestAnimationFrame(() => {
                    reportEl.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                });
            }
        });

        resetButtonEl.addEventListener("click", () => {
            if (shouldReshuffleOnReset) {
                test = randomizeAutoTest(originalTest);
            }

            formEl.reset();
            renderTest();
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, {
            once: true,
        });
    } else {
        start();
    }
}