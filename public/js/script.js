document.addEventListener("DOMContentLoaded", () => {
  // Attache les listeners aux boutons d'édition
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", () => {
      console.log("Clic sur bouton d'édition !");
      const index = btn.dataset.index;
      const id = btn.dataset.id;
      enableEdit(index, id);
    });
  });
});

function enableEdit(index, id) {
  console.log(`Édition de l'article ${id} à l'index ${index}`);
  const titleCell = document.getElementById(`title-${index}`);
  const descCell = document.getElementById(`desc-${index}`);
  const formatCell = document.getElementById(`format-${index}`);
  const fileCell = document.getElementById(`file-${index}`);
  const actionsCell = document.getElementById(`actions-${index}`);
  const tagCell = document.getElementById(`tags-${index}`);

  const title = titleCell.innerText.trim();
  const description = descCell.innerText.trim();
  const format = formatCell.innerText.trim();

  titleCell.innerHTML = `<input type="text" value="${title}" class="form-input" name="title">`;
  descCell.innerHTML = `<input type="text" value="${description}" class="form-input" name="description">`;
  formatCell.innerHTML = `
      <select name="format" class="form-input">
        <option value="text" ${
          format === "text" ? "selected" : ""
        }>texte</option>
        <option value="image" ${
          format === "image" ? "selected" : ""
        }>image</option>
        <option value="audio" ${
          format === "audio" ? "selected" : ""
        }>audio</option>
        <option value="video" ${
          format === "video" ? "selected" : ""
        }>video</option>
        <option value="epub" ${
          format === "epub" ? "selected" : ""
        }>epub</option>
        <option value="pdf" ${format === "pdf" ? "selected" : ""}>pdf</option>
      </select>
    `;
  fileCell.innerHTML = `<input type="file" name="file" class="form-input">`;
  tagCell.innerHTML = `<input type="text" name="tags" class="form-input">`;

  actionsCell.innerHTML = `
      <form id="edit-form-${index}" enctype="multipart/form-data" action="/docs/${id}?_method=PUT" method="POST">
        <button type="submit" class="btn-save"><i class="fa-solid fa-check"></i></button>
      </form>
      <button class="btn-cancel" data-reload="true"><i class="fa-solid fa-xmark"></i></button>
    `;

  // Écoute le submit du formulaire
  const form = document.getElementById(`edit-form-${index}`);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newTitle = titleCell.querySelector("input").value;
    const newDesc = descCell.querySelector("input").value;
    const newFormat = formatCell.querySelector("select").value;
    const newFile = fileCell.querySelector("input[type='file']").files[0];

    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("description", newDesc);
    formData.append("format", newFormat);
    if (newFile) formData.append("file", newFile);

    try {
      const response = await fetch(`/docs/${id}?_method=PUT`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Article mis à jour !");
        window.location.reload();
      } else {
        alert("Erreur de mise à jour");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de réseau");
    }
  });

  // Bouton d'annulation sans onclick inline
  const cancelBtn = actionsCell.querySelector(".btn-cancel");
  cancelBtn.addEventListener("click", () => {
    window.location.reload();
  });
}
