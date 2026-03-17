const select = (selector) => document.querySelector(selector);
const selectAll = (selector) => Array.from(document.querySelectorAll(selector));

const initSmoothScroll = () => {
  selectAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
};

const initNavToggle = () => {
  const toggle = select(".nav-toggle");
  const links = select(".nav-links");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
  });

  links.addEventListener("click", (event) => {
    if (event.target.tagName.toLowerCase() === "a") {
      links.classList.remove("is-open");
      toggle.classList.remove("is-open");
    }
  });
};

const animateMetrics = () => {
  const metrics = selectAll(".metric-number");
  if (!metrics.length) return;

  const options = { threshold: 0.4 };
  const formatValue = (el, value) => {
    const text = el.dataset.targetSuffix || el.textContent.replace(/[0-9]/g, "");
    return `${Math.round(value)}${text}`;
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.target || "0");
      if (!target || el.dataset.animated === "true") return;

      el.dataset.animated = "true";

      const isPercent = el.textContent.includes("%");
      const isHours = el.textContent.toLowerCase().includes("h");
      const isTimes = el.textContent.toLowerCase().includes("x");

      if (isPercent) el.dataset.targetSuffix = "%";
      else if (isHours) el.dataset.targetSuffix = "h";
      else if (isTimes) el.dataset.targetSuffix = "x";

      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = formatValue(el, value);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, options);

  metrics.forEach((el) => observer.observe(el));
};

const initScrollReveal = () => {
  const revealElements = selectAll(
    ".solution-card, .case-card, .step, .diagram, .af-form, .form-copy"
  );
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach((el, index) => {
    el.style.transitionDelay = `${(index % 4) * 0.04}s`;
    observer.observe(el);
  });
};

const initSimulationScroll = () => {
  const button = select("#btn-ver-simulacao");
  const target = select("#como-funciona");
  if (!button || !target) return;

  button.addEventListener("click", () => {
    const offset = 70;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
  });
};

const initBackToTop = () => {
  const button = select("#btn-voltar-topo");
  if (!button) return;

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

const initHeroParallax = () => {
  const container = select(".hero-visual");
  const orbital = select(".orbital");
  if (!container || !orbital) return;

  const maxTilt = 8;

  const handleMove = (event) => {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const percentX = (x / rect.width) * 2 - 1;
    const percentY = (y / rect.height) * 2 - 1;

    const rotateX = -percentY * maxTilt;
    const rotateY = percentX * maxTilt;

    orbital.style.transform = `rotate3d(${rotateX}, ${rotateY}, 0, 12deg)`;
  };

  const handleLeave = () => {
    orbital.style.transform = "";
  };

  container.addEventListener("mousemove", handleMove);
  container.addEventListener("mouseleave", handleLeave);
};

const validateForm = () => {
  const form = select("#Airaflux-form") || select("#airaflux-form") || select(".af-form");
  if (!form) return null;

  const fields = {
    nome: form.elements.nome,
    email: form.elements.email,
    telefone: form.elements.telefone,
    ideia: form.elements.ideia,
  };

  const showError = (fieldName, message) => {
    const field = fields[fieldName];
    if (!field) return;
    const msgEl = select(`.error-message[data-for="${fieldName}"]`);
    if (msgEl) msgEl.textContent = message;
    field.classList.toggle("error", Boolean(message));
  };

  Object.keys(fields).forEach((key) => showError(key, ""));

  let isValid = true;

  if (!fields.nome.value.trim()) {
    showError("nome", "Informe o nome da pessoa ou empresa.");
    isValid = false;
  }

  const email = fields.email.value.trim();
  if (!email) {
    showError("email", "Informe um e-mail.");
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("email", "Informe um e-mail válido.");
    isValid = false;
  }

  if (!fields.telefone.value.trim()) {
    showError("telefone", "Informe um telefone ou WhatsApp.");
    isValid = false;
  }

  const ideia = fields.ideia.value.trim();
  if (!ideia) {
    showError("ideia", "Conte um pouco sobre o que gostaria de automatizar.");
    isValid = false;
  } else if (ideia.length < 20) {
    showError(
      "ideia",
      "Descreva com um pouco mais de detalhes (pelo menos 20 caracteres)."
    );
    isValid = false;
  }

  return isValid ? { form, fields } : null;
};

const initForm = () => {
  const form = select("#Airaflux-form") || select("#airaflux-form") || select(".af-form");
  const feedback = select("#form-feedback");
  if (!form || !feedback) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";
    feedback.className = "form-feedback";

    const validation = validateForm();
    if (!validation) {
      feedback.textContent = "Revise os campos destacados antes de enviar.";
      feedback.classList.add("error");
      return;
    }

    const { fields } = validation;

    const payload = {
      nome: fields.nome.value.trim(),
      email: fields.email.value.trim(),
      telefone: fields.telefone.value.trim(),
      ideia: fields.ideia.value.trim(),
      impacto: form.elements.impacto.value || "",
      origem: "landing_page_airaflux",
      timestamp: new Date().toISOString(),
    };

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    try {
      const response = await fetch(
        "https://n8n-jowco44o0oo4w8448sgc880c.app5.w8hub.com.br/webhook/airaflux_form",
        {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      feedback.textContent =
        "Recebemos sua ideia! Em breve a equipe da Airaflux entrará em contato.";
      feedback.classList.add("success");
      form.reset();
    } catch (error) {
      feedback.textContent =
        "Não foi possível enviar agora. Verifique sua conexão e tente novamente em instantes.";
      feedback.classList.add("error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
};

window.addEventListener("DOMContentLoaded", () => {
  initSmoothScroll();
  initNavToggle();
  animateMetrics();
  initScrollReveal();
  initSimulationScroll();
  initBackToTop();
  initForm();
  initHeroParallax();
});

