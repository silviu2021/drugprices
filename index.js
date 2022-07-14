const url = "https://search.drugprices.co";

const _search = (key, url) => (path, method, body) =>
  new Promise(async (acc, reject) => {
    const options = {
      method: method ? method : body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
    };
    if (body) options.body = JSON.stringify(body);
    try {
      let rs = await fetch(`${url}/${path}`, options);
      try {
        rs = await rs.json();
      } catch (err) {}
      acc(rs);
    } catch (err) {
      acc([]);
    }
  });

const search = _search(
  "9ZQ4XlF51c669e0de71aa913abdeac470890e765a23dae6b7bab67580f4f1f59470e62d0",
  `${url}`
);
let lastSearch = "";
document.querySelector(".search").addEventListener("keyup", (e) => {
  if (e.target.value) {
    lastSearch = e.target.value;
    search("indexes/drugs/search", "POST", {
      q: e.target.value,
      attributesToHighlight: ["drugname"],
      limit: 200,
    }).then((data) => {
      if (lastSearch == e.target.value) {
        results = data.hits.reduce((a, v) => {
          if (!a[btoa(v.drugname)]) {
            a[btoa(v.drugname)] = {
              id: btoa(v.drugname),
              count: 1,
              name: v.drugname,
              nameHighlight: v._formatted.drugname,
              documents: [v],
            };
          } else {
            a[btoa(v.drugname)].count++;
            a[btoa(v.drugname)].documents.push(v);
          }
          return a;
        }, {});
        renderResults();
      }
    });
  } else renderResults([]);
});
let results = {};
let result = {};
const renderResults = () => {
  document.querySelectorAll(".drug-wrapper .item").forEach((element) => {
    element.parentNode.removeChild(element);
  });
  document.querySelector(".drug-wrapper").classList.remove("show");
  document.querySelector(".results").innerHTML = Object.values(results)
    .map(
      (drug) =>
        `<div class="result" onclick="drugSelected('${drug.id}')">${drug.nameHighlight} (${drug.count})</div>`
    )
    .join("");
};

async function drugSelected(id) {
  result = results[id];
  results = {};
  renderResults();
  document.querySelectorAll(".drug-wrapper .item").forEach((element) => {
    element.parentNode.removeChild(element);
  });
  document.querySelector(".drug-wrapper").classList.add("show");
  result.documents.forEach((element) => {
    let el = document.createElement("div");
    el.classList.add("item");
    el.innerHTML = `
        <div>${element.pharmacy}</div>
        <div>${element.discount}</div>
        <div>${element.delivery}</div>
        <div>${element.price}</div>
        <div>get free savings</div>
  `;

    document
      .querySelector(".drug-wrapper .header")
      .parentNode.insertBefore(
        el,
        document.querySelector(".drug-wrapper .header").nextSibling
      );

    document.querySelector(".search").value = "";

  });
}
