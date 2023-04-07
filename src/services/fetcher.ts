export const getFetcher = (url) =>
  fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage
        .getItem("privy:token")
        .replace(/"/g, "")}`,
    },
  }).then((res) => res.json());
