document.documentElement.classList.add("js");

const revealTargets = Array.from(document.querySelectorAll("[data-reveal]"));

const revealAll = () => {
  revealTargets.forEach((element) => element.classList.add("is-visible"));
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  revealAll();
} else {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealTargets.forEach((element) => observer.observe(element));
}

const copyButton = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");

const writeStatus = (message) => {
  if (copyStatus) {
    copyStatus.textContent = message;
  }
};

const fallbackCopy = (text) => {
  const temp = document.createElement("textarea");
  temp.value = text;
  temp.setAttribute("readonly", "");
  temp.style.position = "absolute";
  temp.style.left = "-9999px";
  document.body.append(temp);
  temp.select();
  const copied = document.execCommand("copy");
  temp.remove();
  return copied;
};

if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const email = copyButton.dataset.email;
    if (!email) {
      return;
    }

    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      copied = fallbackCopy(email);
    }

    if (copied) {
      copyButton.classList.add("copied");
      copyButton.textContent = "COPIED";
      writeStatus("邮箱已复制，可直接粘贴发送邮件。");

      window.setTimeout(() => {
        copyButton.classList.remove("copied");
        copyButton.textContent = "COPY EMAIL";
      }, 1600);
    } else {
      writeStatus(`复制失败，请手动复制：${email}`);
    }
  });
}

const interactiveCards = document.querySelectorAll(".project-card-link");
const canHover = window.matchMedia("(hover: hover)").matches;

if (canHover) {
  interactiveCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });
}
