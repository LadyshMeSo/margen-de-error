/* =========================================
   MARGEN DE ERROR
   Métodos Numéricos
   JavaScript principal
========================================= */


/* =========================================
   01. INICIO
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    // Navegación
    initializeNavigation();
    initializeScrollNavigation();

    // Sección 01: Glosario
    initializeGlossary();
    initializeIterationDemo();
    initializeApproximationDemo();
    initializeErrorCalculator();
    initializeSignificantFigures();
    initializeTargets();
    initializeUncertainty();
    initializeBias();

    // Sección 02: Clasificación de errores
    initializeRoundingLab();
    initializeErrorLaboratory();

    // Sección 03: Caso práctico
    initializePracticalCase();

    // Sección 04: Zona interactiva
    initializeInteractiveLab();
    initializeQuiz();
    initializeFinalChallenge();
});


/* =========================================
   02. UTILIDADES NUMÉRICAS
========================================= */

// Desplaza el punto decimal sin errores de punto flotante
// (por ejemplo, 0.29 × 100 = 28.999999999999996 en JavaScript).
function shiftDecimals(value, decimals) {
    return Number((Math.abs(value) * 10 ** decimals).toPrecision(12));
}

// Redondeo clásico: si la siguiente cifra es 5 o mayor, se sube.
function roundTo(value, decimals) {
    return Math.sign(value) * Math.round(shiftDecimals(value, decimals)) / 10 ** decimals;
}

// Truncamiento: se eliminan las cifras sobrantes sin modificar la última.
function truncateTo(value, decimals) {
    return Math.sign(value) * Math.trunc(shiftDecimals(value, decimals)) / 10 ** decimals;
}

// Lee un campo numérico. Devuelve null si está vacío o no es válido.
function readNumber(input) {
    const text = input.value.trim();

    if (text === "") return null;

    const number = Number(text);

    return Number.isFinite(number) ? number : null;
}

// "0 decimales", "1 decimal", "2 decimales"…
function decimalsLabel(decimals) {
    const words = ["cero", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho"];
    const word = words[decimals] ?? decimals;

    return decimals === 1 ? "un decimal" : `${word} decimales`;
}


/* =========================================
   03. NAVEGACIÓN RESPONSIVE
========================================= */

function initializeNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (!menuToggle || !navLinks) return;

    function setMenuState(isOpen) {
        navLinks.classList.toggle("open", isOpen);

        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");

        menuToggle.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
            : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    }

    menuToggle.addEventListener("click", () => {
        setMenuState(!navLinks.classList.contains("open"));
    });

    // Cerrar el menú al seleccionar una sección
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => setMenuState(false));
    });
}


/* =========================================
   04. NAVEGACIÓN SEGÚN SCROLL
   Marca en amarillo la sección visible
========================================= */

function initializeScrollNavigation() {
    const links = [...document.querySelectorAll(".nav-link")];

    const sections = links
        .map(link => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    const header = document.getElementById("header");

    if (!sections.length) return;

    function setActiveLink(sectionId) {
        links.forEach(link => {
            const isActive = link.getAttribute("href") === `#${sectionId}`;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function updateActiveSection() {
        // Línea de referencia: justo debajo de la barra fija
        const referenceLine = (header ? header.offsetHeight : 0) + 40;

        let currentSection = sections[0];

        sections.forEach(section => {
            if (section.getBoundingClientRect().top <= referenceLine) {
                currentSection = section;
            }
        });

        // Al llegar al final de la página se marca la última sección
        const reachedBottom =
            window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

        if (reachedBottom) {
            currentSection = sections[sections.length - 1];
        }

        setActiveLink(currentSection.id);
    }

    let ticking = false;

    window.addEventListener("scroll", () => {
        if (ticking) return;

        ticking = true;

        requestAnimationFrame(() => {
            updateActiveSection();
            ticking = false;
        });
    }, { passive: true });

    window.addEventListener("resize", updateActiveSection);

    updateActiveSection();
}


/* =========================================
   05. GLOSARIO Y TARJETAS DESPLEGABLES
========================================= */

function initializeGlossary() {
    const expandButtons = document.querySelectorAll(".expand-btn");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const conceptCards = document.querySelectorAll(".concept-card");

    // Abrir y cerrar explicaciones
    expandButtons.forEach(button => {
        button.setAttribute("aria-expanded", "false");

        button.addEventListener("click", () => {
            const detail = document.getElementById(button.dataset.target);

            if (!detail) return;

            const isOpening = detail.hidden;

            detail.hidden = !isOpening;

            button.setAttribute("aria-expanded", isOpening);

            // El CSS gira el ícono 90° cuando está abierto:
            // la flecha apunta hacia abajo y la X se mantiene igual.
            button.innerHTML = isOpening
                ? 'Cerrar explicación <i class="fa-solid fa-xmark" aria-hidden="true"></i>'
                : 'Explorar concepto <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';

            if (!isOpening) return;

            setTimeout(() => {
                detail.scrollIntoView({ behavior: "smooth", block: "nearest" });

                if (window.MathJax && typeof MathJax.typesetPromise === "function") {
                    MathJax.typesetPromise([detail]);
                }
            }, 100);
        });
    });

    // Filtros del glosario
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedFilter = button.dataset.filter;

            filterButtons.forEach(item => {
                item.classList.toggle("active", item === button);
            });

            conceptCards.forEach(card => {
                card.hidden = !(selectedFilter === "all" || selectedFilter === card.dataset.category);
            });
        });
    });
}


/* =========================================
   06. MÉTODO NUMÉRICO
   Aproximación de la raíz cuadrada de 2
========================================= */

function initializeIterationDemo() {
    const nextButton = document.getElementById("nextIteration");
    const resetButton = document.getElementById("resetIteration");
    const valueDisplay = document.getElementById("iterationValue");
    const errorDisplay = document.getElementById("iterationError");
    const table = document.getElementById("iterationTable");

    if (!nextButton || !resetButton || !valueDisplay || !errorDisplay || !table) return;

    const TRUE_VALUE = Math.SQRT2;
    const MAX_ITERATIONS = 10;
    const TOLERANCE = 1e-8;

    let currentValue = 1;
    let iteration = 0;

    function getError() {
        return Math.abs(TRUE_VALUE - currentValue);
    }

    function updateDisplay() {
        valueDisplay.textContent = currentValue.toFixed(6);
        errorDisplay.textContent = getError().toFixed(8);
    }

    function addRow() {
        const row = document.createElement("tr");

        [iteration, currentValue.toFixed(6), getError().toFixed(8)].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    }

    function finish(message) {
        nextButton.disabled = true;
        nextButton.innerHTML = `<i class="fa-solid fa-check" aria-hidden="true"></i> ${message}`;
    }

    function reset() {
        currentValue = 1;
        iteration = 0;

        table.replaceChildren();

        nextButton.disabled = false;
        nextButton.innerHTML =
            'Siguiente iteración <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';

        updateDisplay();
        addRow();
    }

    // Siguiente iteración: x(n+1) = ½ (x(n) + 2 / x(n))
    nextButton.addEventListener("click", () => {
        currentValue = 0.5 * (currentValue + 2 / currentValue);
        iteration++;

        updateDisplay();
        addRow();

        if (getError() < TOLERANCE) {
            finish("Resultado alcanzado");
        } else if (iteration >= MAX_ITERATIONS) {
            finish("Límite alcanzado");
        }
    });

    resetButton.addEventListener("click", reset);

    reset();
}


/* =========================================
   07. APROXIMACIÓN
   Recta numérica de π
========================================= */

function initializeApproximationDemo() {
    const slider = document.getElementById("approxSlider");
    const valueDisplay = document.getElementById("approxValue");
    const errorDisplay = document.getElementById("approxError");
    const marker = document.getElementById("approxMarker");

    if (!slider || !valueDisplay || !errorDisplay || !marker) return;

    function updateApproximation() {
        const approximation = Number(slider.value);
        const error = Math.abs(Math.PI - approximation);

        valueDisplay.textContent = approximation.toFixed(5);
        errorDisplay.textContent = error.toFixed(8);

        // Convertir el valor en una posición sobre la recta
        const min = Number(slider.min);
        const max = Number(slider.max);
        const percentage = ((approximation - min) / (max - min)) * 100;

        marker.style.left = `${percentage}%`;
    }

    slider.addEventListener("input", updateApproximation);

    updateApproximation();
}


/* =========================================
   08. ERROR NUMÉRICO
   Calculadora de error absoluto
========================================= */

function initializeErrorCalculator() {
    const trueInput = document.getElementById("trueValue");
    const approximateInput = document.getElementById("estimatedValue");
    const result = document.getElementById("absoluteError");

    if (!trueInput || !approximateInput || !result) return;

    function calculateError() {
        if (trueInput.value.trim() === "" || approximateInput.value.trim() === "") {
            result.textContent = "—";
            return;
        }

        const real = readNumber(trueInput);
        const estimated = readNumber(approximateInput);

        if (real === null || estimated === null) {
            result.textContent = "Valor inválido";
            return;
        }

        // Ocho decimales como máximo, sin ceros sobrantes al final
        result.textContent = Number(Math.abs(real - estimated).toFixed(8)).toString();
    }

    trueInput.addEventListener("input", calculateError);
    approximateInput.addEventListener("input", calculateError);

    calculateError();
}


/* =========================================
   09. CIFRAS SIGNIFICATIVAS
========================================= */

function countSignificantFigures(value) {
    // Número decimal, entero o en notación científica
    const numberPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

    if (!value || !numberPattern.test(value)) return null;

    const isScientific = /[eE]/.test(value);
    const mantissa = value.split(/[eE]/)[0];
    const hasDecimal = mantissa.includes(".");

    // Quitar signo, punto y ceros a la izquierda
    let digits = mantissa.replace(/^[+-]/, "").replace(".", "").replace(/^0+/, "");

    if (!digits) return 0;

    // Los ceros finales solo cuentan si hay punto decimal o notación científica
    if (!hasDecimal && !isScientific) {
        digits = digits.replace(/0+$/, "");
    }

    return digits.length;
}

function initializeSignificantFigures() {
    const input = document.getElementById("significantInput");
    const counter = document.getElementById("significantCount");
    const highlight = document.getElementById("highlightNumber");

    if (!input || !counter || !highlight) return;

    function updateSignificantFigures() {
        const value = input.value.trim();

        if (value === "") {
            counter.textContent = "0";
            highlight.textContent = "Escribe un número";
            return;
        }

        const result = countSignificantFigures(value);

        if (result === null) {
            counter.textContent = "—";
            highlight.textContent = "Formato no válido";
            return;
        }

        counter.textContent = result;
        highlight.textContent = value;
    }

    input.addEventListener("input", updateSignificantFigures);

    updateSignificantFigures();
}


/* =========================================
   10. DIANAS
   Precisión y exactitud
========================================= */

const TARGET_CASES = {
    both:      { spread: 7,  offsetX: 0,  offsetY: 0 },
    precision: { spread: 7,  offsetX: 35, offsetY: -25 },
    accuracy:  { spread: 34, offsetX: 0,  offsetY: 0 },
    neither:   { spread: 34, offsetX: 35, offsetY: -25 },
    bias:      { spread: 8,  offsetX: 34, offsetY: -22 },
    dispersed: { spread: 32, offsetX: 0,  offsetY: 0 }
};

function createTarget(caseType = "both", seed = 0) {
    const CENTER = 100;
    const POINT_COUNT = 12;
    const GOLDEN_ANGLE = 2.399963229728653;

    const settings = TARGET_CASES[caseType] || TARGET_CASES.both;

    let points = "";

    for (let i = 0; i < POINT_COUNT; i++) {
        const angle = i * GOLDEN_ANGLE + seed * 0.37;
        const distance = settings.spread * Math.sqrt((i + 0.5) / POINT_COUNT);

        const x = CENTER + settings.offsetX + Math.cos(angle) * distance;
        const y = CENTER + settings.offsetY + Math.sin(angle) * distance;

        points += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.8" class="target-point" />`;
    }

    return `
        <svg class="target-svg" viewBox="0 0 200 200" role="img" aria-label="Diana de mediciones">
            <circle cx="100" cy="100" r="76" fill="#EAF0F5" stroke="#68A0C1" stroke-width="1" />
            <circle cx="100" cy="100" r="54" fill="#D7E5EE" stroke="#68A0C1" stroke-width="1" />
            <circle cx="100" cy="100" r="32" fill="#9AAF54" stroke="#2C5A3E" stroke-width="1" />
            <circle cx="100" cy="100" r="13" fill="#E9CC0A" stroke="#00204D" stroke-width="1" />
            <circle cx="100" cy="100" r="3" fill="#00204D" />
            ${points}
        </svg>
    `;
}

function initializeTargets() {
    // Cuatro escenarios de exactitud y precisión
    document.querySelectorAll("[data-target-case]").forEach(target => {
        target.innerHTML = createTarget(target.dataset.targetCase);
    });

    // Demostración de precisión
    const precisionContainer = document.getElementById("precisionTarget");
    const changeButton = document.getElementById("changePrecision");

    if (!precisionContainer || !changeButton) return;

    const scenarios = ["both", "dispersed"];

    let currentScenario = 0;
    let seed = 0;

    function renderPrecision() {
        precisionContainer.innerHTML = createTarget(scenarios[currentScenario], seed);
    }

    changeButton.addEventListener("click", () => {
        currentScenario = (currentScenario + 1) % scenarios.length;
        seed++;

        renderPrecision();

        // El botón indica lo que pasará en el siguiente clic
        changeButton.innerHTML = scenarios[currentScenario] === "dispersed"
            ? 'Mostrar puntos agrupados <i class="fa-solid fa-compress" aria-hidden="true"></i>'
            : 'Mostrar puntos dispersos <i class="fa-solid fa-shuffle" aria-hidden="true"></i>';
    });

    renderPrecision();
}


/* =========================================
   11. INCERTIDUMBRE
========================================= */

function initializeUncertainty() {
    const slider = document.getElementById("uncertaintySlider");
    const valueDisplay = document.getElementById("uncertaintyValue");
    const lowerLimit = document.getElementById("lowerLimit");
    const upperLimit = document.getElementById("upperLimit");
    const range = document.getElementById("uncertaintyRange");

    if (!slider || !valueDisplay || !lowerLimit || !upperLimit || !range) return;

    const CENTRAL_VALUE = 25;

    function updateUncertainty() {
        const uncertainty = Number(slider.value);
        const maxUncertainty = Number(slider.max);

        valueDisplay.textContent = `±${uncertainty.toFixed(2)} mm`;
        lowerLimit.textContent = (CENTRAL_VALUE - uncertainty).toFixed(2);
        upperLimit.textContent = (CENTRAL_VALUE + uncertainty).toFixed(2);

        // Ampliar o reducir el intervalo visual alrededor del centro
        const halfWidth = (uncertainty / maxUncertainty) * 50;

        range.style.left = `${50 - halfWidth}%`;
        range.style.width = `${halfWidth * 2}%`;
    }

    slider.addEventListener("input", updateUncertainty);

    updateUncertainty();
}


/* =========================================
   12. SESGO
========================================= */

function initializeBias() {
    const biasContainer = document.getElementById("biasTarget");
    const biasButton = document.getElementById("showBias");

    if (!biasContainer || !biasButton) return;

    const SVG_NS = "http://www.w3.org/2000/svg";

    let visible = false;

    function addBiasArrow() {
        const svg = biasContainer.querySelector("svg");

        if (!svg) return;

        const defs = document.createElementNS(SVG_NS, "defs");

        defs.innerHTML = `
            <marker id="biasArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="none" stroke="#E9CC0A" stroke-width="1" />
            </marker>
        `;

        const arrow = document.createElementNS(SVG_NS, "line");

        Object.entries({
            x1: 100,
            y1: 100,
            x2: 134,
            y2: 78,
            stroke: "#E9CC0A",
            "stroke-width": 3,
            "stroke-linecap": "round",
            "marker-end": "url(#biasArrow)"
        }).forEach(([name, value]) => arrow.setAttribute(name, value));

        svg.append(defs, arrow);
    }

    function renderBias() {
        biasContainer.innerHTML = createTarget(visible ? "bias" : "both");

        if (visible) addBiasArrow();

        biasButton.innerHTML = visible
            ? 'Ocultar desplazamiento <i class="fa-solid fa-eye-slash" aria-hidden="true"></i>'
            : 'Mostrar desplazamiento <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>';
    }

    biasButton.addEventListener("click", () => {
        visible = !visible;
        renderBias();
    });

    renderBias();
}


/* =========================================
   13. SECCIÓN 02: REDONDEO VS. TRUNCAMIENTO
========================================= */

function initializeRoundingLab() {
    const numberInput = document.getElementById("roundingNumber");
    const decimalsSelect = document.getElementById("decimalPlaces");
    const roundedOutput = document.getElementById("roundedResult");
    const roundedErrorOutput = document.getElementById("roundedError");
    const truncatedOutput = document.getElementById("truncatedResult");
    const truncatedErrorOutput = document.getElementById("truncatedError");
    const explanation = document.getElementById("roundingExplanation");

    if (!numberInput || !decimalsSelect || !roundedOutput || !truncatedOutput || !explanation) return;

    function updateRounding() {
        const original = readNumber(numberInput);
        const decimals = Number(decimalsSelect.value);

        if (original === null) {
            roundedOutput.textContent = "—";
            truncatedOutput.textContent = "—";
            roundedErrorOutput.textContent = "Error: —";
            truncatedErrorOutput.textContent = "Error: —";
            explanation.textContent = "Escribe un número válido para comparar ambos procedimientos.";
            return;
        }

        const rounded = roundTo(original, decimals);
        const truncated = truncateTo(original, decimals);

        roundedOutput.textContent = rounded.toFixed(decimals);
        truncatedOutput.textContent = truncated.toFixed(decimals);

        roundedErrorOutput.textContent = `Error: ${Math.abs(original - rounded).toFixed(8)}`;
        truncatedErrorOutput.textContent = `Error: ${Math.abs(original - truncated).toFixed(8)}`;

        const label = decimalsLabel(decimals);

        explanation.textContent = rounded === truncated
            ? `Con ${label}, ambos procedimientos dan el mismo resultado: la cifra siguiente es menor que cinco ` +
              "o no hay cifras que eliminar."
            : `Ambos procedimientos conservan ${label}, pero el redondeo ajustó el último dígito ` +
              "porque la cifra siguiente es cinco o mayor; el truncamiento solo eliminó las cifras sobrantes.";
    }

    numberInput.addEventListener("input", updateRounding);
    decimalsSelect.addEventListener("change", updateRounding);

    updateRounding();
}


/* =========================================
   14. SECCIÓN 02: CALCULADORA DE ERRORES
========================================= */

function initializeErrorLaboratory() {
    const trueInput = document.getElementById("laboratoryTrue");
    const approximateInput = document.getElementById("laboratoryApprox");
    const absoluteOutput = document.getElementById("labAbsolute");
    const relativeOutput = document.getElementById("labRelative");
    const percentageOutput = document.getElementById("labPercentage");
    const stepsContainer = document.getElementById("calculationSteps");

    if (!trueInput || !approximateInput || !stepsContainer) return;

    function renderSteps(lines) {
        const title = document.createElement("h4");
        title.textContent = "Procedimiento";

        const paragraphs = lines.map(line => {
            const paragraph = document.createElement("p");
            paragraph.textContent = line;
            return paragraph;
        });

        stepsContainer.replaceChildren(title, ...paragraphs);
    }

    function calculateErrors() {
        const real = readNumber(trueInput);
        const approximate = readNumber(approximateInput);

        if (real === null || approximate === null) {
            absoluteOutput.textContent = "—";
            relativeOutput.textContent = "—";
            percentageOutput.textContent = "—";
            renderSteps(["Ingresa dos valores numéricos válidos para calcular los errores."]);
            return;
        }

        const absolute = Math.abs(real - approximate);

        absoluteOutput.textContent = absolute.toFixed(4);

        const steps = [`1. Error absoluto: |${real} − ${approximate}| = ${absolute.toFixed(4)}`];

        if (real === 0) {
            relativeOutput.textContent = "No definido";
            percentageOutput.textContent = "No definido";

            steps.push(
                "2. Error relativo: no se puede calcular porque el valor verdadero es cero.",
                "3. Error porcentual: no se puede calcular porque depende del error relativo."
            );
        } else {
            const relative = absolute / Math.abs(real);
            const percentage = relative * 100;

            relativeOutput.textContent = relative.toFixed(4);
            percentageOutput.textContent = `${percentage.toFixed(4)}%`;

            steps.push(
                `2. Error relativo: ${absolute.toFixed(4)} / |${real}| = ${relative.toFixed(4)}`,
                `3. Error porcentual: ${relative.toFixed(4)} × 100 = ${percentage.toFixed(4)}%`
            );
        }

        renderSteps(steps);
    }

    // Los resultados cambian automáticamente al escribir
    [trueInput, approximateInput].forEach(input => {
        input.addEventListener("input", calculateErrors);
    });

    calculateErrors();
}


/* =========================================
   15. SECCIÓN 03: LABORATORIO DEL CASO PRÁCTICO
========================================= */

function initializePracticalCase() {
    const trueInput = document.getElementById("practicalTrueValue");
    const approximateInput = document.getElementById("practicalApproxValue");
    const toleranceInput = document.getElementById("practicalTolerance");
    const resetButton = document.getElementById("resetPracticalCase");
    const absoluteOutput = document.getElementById("practicalAbsoluteResult");
    const relativeOutput = document.getElementById("practicalRelativeResult");
    const percentageOutput = document.getElementById("practicalPercentageResult");
    const decisionPanel = document.getElementById("practicalDecision");
    const decisionTitle = document.getElementById("practicalDecisionTitle");
    const decisionText = document.getElementById("practicalDecisionText");
    const procedureContainer = document.getElementById("practicalProcedure");
    const errorMessage = document.getElementById("practicalErrorMessage");

    if (!trueInput || !approximateInput || !toleranceInput || !decisionPanel) return;

    // Valores iniciales del caso de fabricación
    const ORIGINAL_VALUES = { real: "50", approximate: "49.85", tolerance: "0.10" };

    const format = number => number.toFixed(4);

    // Comprueba que los campos contengan números válidos
    function readPracticalInputs() {
        const fields = [trueInput, approximateInput, toleranceInput];

        if (fields.some(field => field.value.trim() === "")) {
            throw new Error("Completa los tres campos antes de calcular.");
        }

        const [real, approximate, tolerance] = fields.map(readNumber);

        if ([real, approximate, tolerance].includes(null)) {
            throw new Error("Ingresa valores numéricos válidos.");
        }

        if (tolerance < 0) {
            throw new Error("La tolerancia no puede ser negativa.");
        }

        return { real, approximate, tolerance };
    }

    // Actualiza la decisión de calidad
    function updateDecision(accepted, difference, tolerance) {
        decisionPanel.classList.toggle("is-accepted", accepted);

        decisionTitle.textContent = accepted ? "Dentro de tolerancia" : "Fuera de tolerancia";

        decisionText.textContent = accepted
            ? `La diferencia de ${format(difference)} mm no supera la tolerancia de ${format(tolerance)} mm. ` +
              "La pieza cumple con el criterio dimensional establecido."
            : `La diferencia de ${format(difference)} mm supera la tolerancia de ${format(tolerance)} mm. ` +
              "La pieza requiere revisión o ajuste.";

        const symbol = decisionPanel.querySelector(".decision-symbol");

        if (symbol) symbol.textContent = accepted ? "✓" : "!";
    }

    // Construye el procedimiento mostrado al visitante
    function updateProcedure(real, approximate, absolute, relative, percentage) {
        const steps = [`1. Error absoluto: |${real} − ${approximate}| = ${format(absolute)} mm`];

        if (relative === null) {
            steps.push(
                "2. Error relativo: no se puede calcular porque el valor real es cero.",
                "3. Error porcentual: no se puede calcular porque depende del error relativo."
            );
        } else {
            steps.push(
                `2. Error relativo: ${format(absolute)} / |${real}| = ${format(relative)}`,
                `3. Error porcentual: ${format(relative)} × 100 = ${format(percentage)} %`
            );
        }

        procedureContainer.replaceChildren(...steps.map(step => {
            const paragraph = document.createElement("p");
            paragraph.textContent = step;
            return paragraph;
        }));
    }

    function calculatePracticalCase() {
        try {
            errorMessage.textContent = "";

            const { real, approximate, tolerance } = readPracticalInputs();

            const absolute = Math.abs(real - approximate);
            const relative = real !== 0 ? absolute / Math.abs(real) : null;
            const percentage = relative !== null ? relative * 100 : null;

            absoluteOutput.textContent = format(absolute);
            relativeOutput.textContent = relative !== null ? format(relative) : "No definido";
            percentageOutput.textContent = percentage !== null ? format(percentage) : "No definido";

            // Margen mínimo para evitar errores de punto flotante (0.1 vs 0.10000000001)
            const accepted = absolute <= tolerance + 1e-9;

            updateDecision(accepted, absolute, tolerance);
            updateProcedure(real, approximate, absolute, relative, percentage);
        } catch (error) {
            errorMessage.textContent = error.message;
        }
    }

    function resetPracticalCase() {
        trueInput.value = ORIGINAL_VALUES.real;
        approximateInput.value = ORIGINAL_VALUES.approximate;
        toleranceInput.value = ORIGINAL_VALUES.tolerance;

        calculatePracticalCase();
    }

    resetButton.addEventListener("click", resetPracticalCase);

    // Los resultados cambian automáticamente al escribir
    [trueInput, approximateInput, toleranceInput].forEach(input => {
        input.addEventListener("input", calculatePracticalCase);
    });

    calculatePracticalCase();
}


/* =========================================
   16. SECCIÓN 04: LABORATORIO DE CÁLCULO
========================================= */

function initializeInteractiveLab() {
    const trueInput = document.getElementById("interactiveTrueValue");
    const approximateInput = document.getElementById("interactiveApproxValue");
    const decimalsInput = document.getElementById("interactiveDecimals");
    const resetButton = document.getElementById("resetInteractiveCalculator");
    const roundedValueOutput = document.getElementById("interactiveRoundedValue");
    const truncatedValueOutput = document.getElementById("interactiveTruncatedValue");
    const roundedErrorOutput = document.getElementById("interactiveRoundedError");
    const truncatedErrorOutput = document.getElementById("interactiveTruncatedError");
    const absoluteErrorOutput = document.getElementById("interactiveAbsoluteError");
    const relativeErrorOutput = document.getElementById("interactiveRelativeError");
    const percentageErrorOutput = document.getElementById("interactivePercentageError");
    const observationOutput = document.getElementById("interactiveObservation");
    const errorOutput = document.getElementById("interactiveCalculatorError");

    if (!trueInput || !approximateInput || !decimalsInput) return;

    const ORIGINAL_VALUES = { real: "3.14159265", approximate: "3.14", decimals: "4" };

    const format = value => value.toFixed(8);

    function calculateInteractiveLab() {
        errorOutput.textContent = "";

        if (trueInput.value.trim() === "" || approximateInput.value.trim() === "") {
            errorOutput.textContent = "Ingresa el valor real y el valor aproximado.";
            return;
        }

        const real = readNumber(trueInput);
        const approximate = readNumber(approximateInput);
        const decimals = Number(decimalsInput.value);

        if (real === null || approximate === null) {
            errorOutput.textContent = "Los valores deben ser números válidos.";
            return;
        }

        if (!Number.isInteger(decimals) || decimals < 0 || decimals > 8) {
            errorOutput.textContent = "Selecciona una cantidad de decimales válida.";
            return;
        }

        // Redondeo y truncamiento del VALOR REAL con los decimales elegidos
        const rounded = roundTo(real, decimals);
        const truncated = truncateTo(real, decimals);

        const roundedError = Math.abs(real - rounded);
        const truncatedError = Math.abs(real - truncated);

        roundedValueOutput.textContent = rounded.toFixed(decimals);
        truncatedValueOutput.textContent = truncated.toFixed(decimals);
        roundedErrorOutput.textContent = `Error: ${format(roundedError)}`;
        truncatedErrorOutput.textContent = `Error: ${format(truncatedError)}`;

        // Errores de la aproximación escrita por el usuario
        const absoluteError = Math.abs(real - approximate);

        absoluteErrorOutput.textContent = format(absoluteError);

        if (real === 0) {
            relativeErrorOutput.textContent = "No definido";
            percentageErrorOutput.textContent = "No definido";
            observationOutput.textContent =
                "El valor real es cero. Por ello, el error relativo y el porcentual " +
                "no están definidos. El error absoluto sí puede calcularse.";
            return;
        }

        const relativeError = absoluteError / Math.abs(real);

        relativeErrorOutput.textContent = format(relativeError);
        percentageErrorOutput.textContent = `${(relativeError * 100).toFixed(6)}%`;

        if (roundedError < truncatedError) {
            observationOutput.textContent =
                "En este experimento, el redondeo produce una aproximación más cercana " +
                "al valor real que el truncamiento.";
        } else if (truncatedError < roundedError) {
            observationOutput.textContent =
                "En este experimento, el truncamiento produce una aproximación más cercana " +
                "al valor real que el redondeo.";
        } else {
            observationOutput.textContent =
                "Ambos métodos producen el mismo error absoluto con los decimales seleccionados.";
        }
    }

    function resetInteractiveLab() {
        trueInput.value = ORIGINAL_VALUES.real;
        approximateInput.value = ORIGINAL_VALUES.approximate;
        decimalsInput.value = ORIGINAL_VALUES.decimals;

        calculateInteractiveLab();
    }

    resetButton.addEventListener("click", resetInteractiveLab);

    // Los resultados cambian automáticamente al escribir
    trueInput.addEventListener("input", calculateInteractiveLab);
    approximateInput.addEventListener("input", calculateInteractiveLab);
    decimalsInput.addEventListener("change", calculateInteractiveLab);

    calculateInteractiveLab();
}


/* =========================================
   17. SECCIÓN 04: RETO DE CONOCIMIENTOS
========================================= */

const QUIZ_QUESTIONS = [
    {
        question: "¿Cuál es el propósito principal de un método numérico?",
        options: [
            "Eliminar todas las operaciones matemáticas.",
            "Obtener soluciones aproximadas mediante procedimientos numéricos.",
            "Sustituir cualquier medición experimental.",
            "Evitar el uso de fórmulas."
        ],
        correct: 1,
        explanation:
            "Los métodos numéricos permiten encontrar soluciones aproximadas " +
            "a problemas matemáticos mediante operaciones y procedimientos."
    },
    {
        question: "¿Cuál es la diferencia entre precisión y exactitud?",
        options: [
            "Son exactamente lo mismo.",
            "La precisión mide la cercanía al valor real y la exactitud la repetición.",
            "La precisión se relaciona con la repetibilidad y la exactitud con la cercanía al valor real.",
            "La exactitud solamente se utiliza en matemáticas."
        ],
        correct: 2,
        explanation:
            "La precisión describe qué tan agrupados están los resultados " +
            "repetidos; la exactitud indica qué tan cerca están del valor real."
    },
    {
        question: "¿Cómo se calcula el error absoluto?",
        options: [
            "Valor real dividido entre valor aproximado.",
            "Valor real más valor aproximado.",
            "Valor real multiplicado por cien.",
            "Valor absoluto de la diferencia entre el valor real y el aproximado."
        ],
        correct: 3,
        explanation:
            "El error absoluto se calcula mediante Ea = |V − Va|. " +
            "El resultado representa una diferencia no negativa."
    },
    {
        question: "¿Qué representa el error relativo?",
        options: [
            "La proporción del error absoluto respecto al valor real.",
            "La cantidad de cifras significativas.",
            "El número de mediciones realizadas.",
            "La diferencia entre dos aproximaciones."
        ],
        correct: 0,
        explanation:
            "El error relativo se obtiene dividiendo el error absoluto " +
            "entre el valor absoluto del valor real."
    },
    {
        question: "Si el error relativo es 0.025, ¿cuál es el error porcentual?",
        options: ["0.025 %", "2.5 %", "25 %", "250 %"],
        correct: 1,
        explanation:
            "Para convertir el error relativo a porcentaje se multiplica " +
            "por 100: 0.025 × 100 = 2.5 %."
    },
    {
        question: "¿Qué sucede al truncar el número 8.7392 a dos decimales?",
        options: [
            "Se obtiene 8.74.",
            "Se obtiene 8.70.",
            "Se obtiene 8.73.",
            "Se obtiene 8.739."
        ],
        correct: 2,
        explanation:
            "El truncamiento conserva los decimales indicados y elimina " +
            "los siguientes sin modificar el último que se conserva."
    },
    {
        question: "¿Qué representa la incertidumbre en una medición?",
        options: [
            "La cantidad de operaciones realizadas.",
            "El valor exacto de una medición.",
            "La diferencia entre redondeo y truncamiento.",
            "El margen de duda asociado al resultado de una medición."
        ],
        correct: 3,
        explanation:
            "La incertidumbre expresa el margen de duda asociado a una " +
            "medición y permite describir la confianza en el resultado."
    },
    {
        question: "¿Por qué es importante calcular errores en ingeniería?",
        options: [
            "Porque permite evaluar resultados y tomar decisiones sobre su confiabilidad.",
            "Porque garantiza que no existan fallas.",
            "Porque elimina la necesidad de verificar mediciones.",
            "Porque todos los errores tienen el mismo efecto."
        ],
        correct: 0,
        explanation:
            "Analizar los errores ayuda a evaluar mediciones, verificar " +
            "tolerancias y decidir si un resultado es adecuado para una aplicación."
    }
];

function initializeQuiz() {
    const quizStart = document.getElementById("quizStart");
    const quizQuestionArea = document.getElementById("quizQuestionArea");
    const quizFinalResult = document.getElementById("quizFinalResult");
    const startButton = document.getElementById("startQuiz");
    const nextButton = document.getElementById("nextQuizQuestion");
    const restartButton = document.getElementById("restartQuiz");
    const questionCounter = document.getElementById("quizQuestionCounter");
    const scoreCounter = document.getElementById("quizScoreCounter");
    const progressBar = document.getElementById("quizProgressBar");
    const progressFill = document.getElementById("quizProgressFill");
    const questionText = document.getElementById("quizQuestionText");
    const optionsContainer = document.getElementById("quizOptions");
    const feedbackContainer = document.getElementById("quizFeedback");
    const feedbackTitle = document.getElementById("quizFeedbackTitle");
    const feedbackText = document.getElementById("quizFeedbackText");
    const finalScore = document.getElementById("quizFinalScore");
    const finalTitle = document.getElementById("quizFinalTitle");
    const finalMessage = document.getElementById("quizFinalMessage");
    const correctOutput = document.getElementById("quizCorrectAnswers");
    const incorrectOutput = document.getElementById("quizIncorrectAnswers");
    const percentageOutput = document.getElementById("quizFinalPercentage");

    if (!quizStart || !quizQuestionArea || !quizFinalResult || !startButton) return;

    const TOTAL = QUIZ_QUESTIONS.length;

    let currentQuestion = 0;
    let score = 0;
    let answered = false;

    function setProgress(completed) {
        progressFill.style.width = `${(completed / TOTAL) * 100}%`;
        progressBar.setAttribute("aria-valuenow", completed);
        progressBar.setAttribute("aria-valuemax", TOTAL);
    }

    function startQuiz() {
        currentQuestion = 0;
        score = 0;

        quizStart.hidden = true;
        quizFinalResult.hidden = true;
        quizQuestionArea.hidden = false;

        showQuestion();
    }

    function showQuestion() {
        const current = QUIZ_QUESTIONS[currentQuestion];
        const isLast = currentQuestion === TOTAL - 1;

        answered = false;

        questionCounter.textContent = `PREGUNTA ${currentQuestion + 1} DE ${TOTAL}`;
        scoreCounter.textContent = `ACIERTOS: ${score}`;
        questionText.textContent = current.question;

        setProgress(currentQuestion);

        feedbackContainer.hidden = true;
        feedbackContainer.classList.remove("is-incorrect");

        nextButton.disabled = true;
        nextButton.innerHTML = isLast
            ? 'Ver resultados <span aria-hidden="true">→</span>'
            : 'Siguiente pregunta <span aria-hidden="true">→</span>';

        optionsContainer.replaceChildren(...current.options.map((option, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "quiz-option";

            const letter = document.createElement("span");
            letter.className = "quiz-option-letter";
            letter.textContent = String.fromCharCode(65 + index);

            const text = document.createElement("span");
            text.textContent = option;

            button.append(letter, text);
            button.addEventListener("click", () => answerQuestion(index));

            return button;
        }));
    }

    function answerQuestion(selectedIndex) {
        if (answered) return;

        answered = true;

        const current = QUIZ_QUESTIONS[currentQuestion];
        const isCorrect = selectedIndex === current.correct;

        if (isCorrect) score++;

        optionsContainer.querySelectorAll(".quiz-option").forEach((button, index) => {
            button.disabled = true;
            button.classList.toggle("is-correct", index === current.correct);
            button.classList.toggle("is-incorrect", index === selectedIndex && !isCorrect);
        });

        feedbackContainer.hidden = false;
        feedbackContainer.classList.toggle("is-incorrect", !isCorrect);

        feedbackTitle.textContent = isCorrect ? "¡Respuesta correcta!" : "Respuesta incorrecta";
        feedbackText.textContent = current.explanation;

        scoreCounter.textContent = `ACIERTOS: ${score}`;

        setProgress(currentQuestion + 1);

        nextButton.disabled = false;
    }

    function showResults() {
        quizQuestionArea.hidden = true;
        quizFinalResult.hidden = false;

        const percentage = Math.round((score / TOTAL) * 100);

        finalScore.textContent = `${score}/${TOTAL}`;
        correctOutput.textContent = score;
        incorrectOutput.textContent = TOTAL - score;
        percentageOutput.textContent = `${percentage}%`;

        const results = [
            {
                min: 100,
                title: "¡Dominio total!",
                message: "Excelente trabajo. Demostraste un gran dominio de los conceptos."
            },
            {
                min: 75,
                title: "¡Muy buen resultado!",
                message: "Tienes una buena comprensión de los métodos numéricos. Sigue practicando."
            },
            {
                min: 50,
                title: "¡Vas por buen camino!",
                message: "Ya reconoces varios conceptos. Repasa las explicaciones y vuelve a intentarlo."
            },
            {
                min: 0,
                title: "¡La práctica continúa!",
                message: "Regresa al glosario y a la clasificación de errores para reforzar lo aprendido."
            }
        ];

        const result = results.find(item => percentage >= item.min);

        finalTitle.textContent = result.title;
        finalMessage.textContent = result.message;
    }

    function nextStep() {
        if (!answered) return;

        if (currentQuestion < TOTAL - 1) {
            currentQuestion++;
            showQuestion();
        } else {
            showResults();
        }
    }

    startButton.addEventListener("click", startQuiz);
    nextButton.addEventListener("click", nextStep);

    // "Intentar nuevamente" reinicia directamente el cuestionario
    restartButton.addEventListener("click", startQuiz);
}


/* =========================================
   18. SECCIÓN 04: DESAFÍO FINAL
========================================= */

function initializeFinalChallenge() {
    const challengeOptions = document.getElementById("challengeOptions");
    const feedback = document.getElementById("challengeFeedback");
    const feedbackTitle = document.getElementById("challengeFeedbackTitle");
    const feedbackText = document.getElementById("challengeFeedbackText");
    const showSolutionButton = document.getElementById("showChallengeSolution");
    const solution = document.getElementById("challengeSolution");

    if (!challengeOptions || !feedback || !showSolutionButton || !solution) return;

    const CORRECT_ANSWER = "reject";
    const answers = challengeOptions.querySelectorAll(".challenge-option");

    let answered = false;

    function evaluateChallenge(selectedButton) {
        // Solo se puede responder una vez
        if (answered) return;

        answered = true;

        const isCorrect = selectedButton.dataset.answer === CORRECT_ANSWER;

        answers.forEach(button => {
            button.disabled = true;
            button.classList.toggle("is-correct", button.dataset.answer === CORRECT_ANSWER);
            button.classList.toggle("is-incorrect", button === selectedButton && !isCorrect);
        });

        feedback.hidden = false;
        feedback.classList.toggle("is-incorrect", !isCorrect);

        feedbackTitle.textContent = isCorrect
            ? "¡Correcto! Detectaste el problema."
            : "No exactamente. Revisemos los límites.";

        feedbackText.textContent = isCorrect
            ? "La diferencia es de 0.08 mm y supera la tolerancia de 0.05 mm. " +
              "La pieza no cumple con las especificaciones."
            : "La diferencia entre 25.00 mm y 24.92 mm es de 0.08 mm. Como supera " +
              "la tolerancia máxima de 0.05 mm, la pieza debe rechazarse.";

        showSolutionButton.hidden = false;
    }

    answers.forEach(button => {
        button.addEventListener("click", () => evaluateChallenge(button));
    });

    showSolutionButton.addEventListener("click", () => {
        solution.hidden = false;
        showSolutionButton.hidden = true;

        solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
}