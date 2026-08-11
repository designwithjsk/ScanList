// Generates realistic sample checklist image data URLs for instant testing

export function getSampleChecklistImage(type: "handwritten" | "printed"): string {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  if (type === "handwritten") {
    // Warm paper texture background
    ctx.fillStyle = "#fbf8f2";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Blue lined notebook paper
    ctx.strokeStyle = "#dbeafe";
    ctx.lineWidth = 2;
    for (let y = 140; y < canvas.height; y += 65) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Red margin line
    ctx.strokeStyle = "#fca5a5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(110, 0);
    ctx.lineTo(110, canvas.height);
    ctx.stroke();

    // Title
    ctx.fillStyle = "#1e293b";
    ctx.font = "italic bold 38px serif";
    ctx.fillText("GROCERY LIST", 140, 95);

    // Handwritten items
    const items = [
      { text: "• Buy milk (2 gallons)", checked: false },
      { text: "• Call school office", checked: false },
      { text: "• Pay electricity bill", checked: false },
      { text: "• Pick up medicine at CVS", checked: true },
      { text: "• Send tax documents", checked: false },
      { text: "• Clean kitchen filter", checked: true },
      { text: "• Organic apples & bananas", checked: false }
    ];

    ctx.font = "30px cursive, sans-serif";
    ctx.fillStyle = "#1e3a8a";

    items.forEach((item, idx) => {
      const yPos = 205 + idx * 65;
      ctx.fillText(item.text, 140, yPos);
      if (item.checked) {
        // Strike line through handwritten text
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(135, yPos - 10);
        ctx.lineTo(550, yPos - 10);
        ctx.stroke();
      }
    });
  } else {
    // Printed office memo style
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle header bar
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(0, 0, canvas.width, 16);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText("WEEKLY OFFICE CHECKLIST", 80, 100);

    ctx.fillStyle = "#64748b";
    ctx.font = "18px sans-serif";
    ctx.fillText("Department: Operations | Date: Aug 11", 80, 135);

    // Divider line
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 160);
    ctx.lineTo(720, 160);
    ctx.stroke();

    const items = [
      { text: "[ ] Schedule Q3 team alignment meeting", checked: false },
      { text: "[x] Review client pitch deck feedback", checked: true },
      { text: "[ ] Order ergonomic desk chairs", checked: false },
      { text: "[ ] Update product roadmap deck", checked: false },
      { text: "[x] Send weekly email newsletter", checked: true },
      { text: "[ ] Backup database & server logs", checked: false },
    ];

    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#334155";

    items.forEach((item, idx) => {
      const yPos = 230 + idx * 75;
      ctx.fillText(item.text, 80, yPos);
    });
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}
