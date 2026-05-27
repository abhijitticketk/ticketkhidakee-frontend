/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  try {
    const layout = JSON.parse(data); // parse the seat layout
    postMessage({ layout, error: null });
  } catch (error) {
    postMessage({ layout: null, error: error });
  }
});
