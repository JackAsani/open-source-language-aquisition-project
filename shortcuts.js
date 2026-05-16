document.addEventListener("keydown", (e) => {
    const api = window.ParrotMirrorAPI;
    if (!api) return;
  
    if (e.altKey && e.key === "l") {
      api.toggleLoop();
    }
  
    if (e.altKey && e.key === "s") {
      api.setStartToNow();
    }
  
    if (e.altKey && e.key === "e") {
      api.setEndToNow();
    }
  
    if (e.altKey && e.key === ",") {
      api.speedDown();
    }
  
    if (e.altKey && e.key === ".") {
      api.speedUp();
    }
  });