/* Standalone review only; the public landing pages do not load this file. */
for (const card of document.querySelectorAll('[data-problem-id]')) {
  const options = globalThis.SOFA_IMAGE_LIBRARY.filter(image => image.problemId === card.dataset.problemId);
  if (options.length < 2) continue;
  const picture = card.querySelector('img');
  const controls = document.createElement('div');
  controls.className = 'image-controls';
  const label = document.createElement('label');
  const select = document.createElement('select');
  select.id = `image-${card.dataset.problemId}`;
  label.htmlFor = select.id;
  label.textContent = 'Escolher imagem';
  for (const [index, option] of options.entries()) {
    const item = document.createElement('option');
    item.value = String(index);
    item.textContent = `${index + 1} de ${options.length}`;
    select.append(item);
  }
  const previous = document.createElement('button');
  previous.type = 'button';
  previous.textContent = '‹';
  previous.setAttribute('aria-label', `Imagem anterior: ${card.querySelector('h2').textContent}`);
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = '›';
  next.setAttribute('aria-label', `Imagem seguinte: ${card.querySelector('h2').textContent}`);
  const update = () => {
    const choice = options[Number(select.value)];
    picture.src = `assets/${choice.file}`;
    picture.alt = choice.alt;
    picture.dataset.imageId = choice.id;
  };
  select.addEventListener('change', update);
  previous.addEventListener('click', () => { select.value = String((Number(select.value) + options.length - 1) % options.length); update(); });
  next.addEventListener('click', () => { select.value = String((Number(select.value) + 1) % options.length); update(); });
  controls.append(label, previous, select, next);
  card.querySelector('figure').after(controls);
  update();
}
