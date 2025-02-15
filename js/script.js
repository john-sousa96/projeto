const aside = document.querySelector("aside");
const section = document.querySelector("section");
const response = document.querySelector("#response");
const cart = document.querySelector(".cartValue");
const valueCart = document.getElementById("valueCart");
const modal = document.querySelector(".modalShop");
const closedButton = document.querySelector(".closedButton");
const total = document.querySelector(".total");
const finish = document.querySelector(".finishShop");

const logged = localStorage.getItem("logado") || false;

const buyButton = document.querySelector(".buy");
buyButton.addEventListener("click", () => {
  if (logged === "true") {
    return (window.location.href = "./cart.html");
  }
  window.location.href = "./login.html";
});

closedButton.addEventListener("click", function () {
  modal.classList.add("hidden");
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  getCartProducts();
});

const categories = new Set();
let produtos = [];
let render = localStorage.getItem("render") || false;

function addEventListenersToButtons(item, tdQtt, cartItens) {
  const sumButton = tdQtt.querySelector(".sum");
  const minusButton = tdQtt.querySelector(".minus");
  const quantityDisplay = tdQtt.childNodes[1]; // Assume que o elemento de quantidade é o segundo filho de tdQtt

  sumButton.addEventListener("click", () => {
    item.quantidade += 1;
    quantityDisplay.textContent = ` ${item.quantidade} `;
    updateCartInLocalStorage(item);
  });

  minusButton.addEventListener("click", () => {
    if (item.quantidade > 1) {
      item.quantidade -= 1;
      quantityDisplay.textContent = ` ${item.quantidade} `;
      updateCartInLocalStorage(item);
    }
  });
}

function updateCartInLocalStorage(updatedItem) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const itemIndex = cart.findIndex(
    (cartItem) => cartItem.nome === updatedItem.nome
  );
  if (itemIndex !== -1) {
    cart[itemIndex] = updatedItem;
    localStorage.setItem("cart", JSON.stringify(cart));
    getCartProducts(); 
  }
}

function getCartProducts() {
  const numberProductsInCart = JSON.parse(localStorage.getItem("cart")) || [];

  if (numberProductsInCart.length) {
    finish.classList.remove("hidden");
  } else {
    finish.classList.add("hidden");
  }

  valueCart.textContent = numberProductsInCart.length;
  return numberProductsInCart.length;
}

function renderProducts(products) {
  getCartProducts();
  section.innerHTML = "";

  localStorage.setItem("render", true);
  render = localStorage.getItem("render");
  const cartItens = JSON.parse(localStorage.getItem("cart")) || [];

  for (const product of products) {
    const div = document.createElement("div");
    const img = document.createElement("img");
    const h2 = document.createElement("h2");
    const h3 = document.createElement("h3");
    const button = document.createElement("button");

    div.classList.add("product", "position-relative");
    img.src = product.img;
    img.alt = `image ${product.nome}`;
    h2.textContent = product.nome;
    h2.classList.add("m-0", "text-capitalize", "fs-5");
    h3.textContent = product.valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    h3.classList.add("m-0", "text-capitalize", "fs-6");
    button.textContent = "Adicionar ao carrinho";

    button.addEventListener("click", function () {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      if (cart.some((cartProduct) => cartProduct.nome === product.nome)) {
        return alert("Esse item ja foi adicionado ao carrinho");
      }

      cart.push({ ...product, quantidade: 1 });

      localStorage.setItem("cart", JSON.stringify(cart));
      getCartProducts();
    });

    section.appendChild(div);
    div.append(img, h2, h3, button);
  }

  cart.addEventListener("click", function () {
    const cartStorage = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cartStorage.length) return alert("Seu carrinho esta vazio");
    modal.classList.remove("hidden");
    cartStorage.forEach((item) => {
      console.log({ item });

      const tr = document.createElement("tr");
      const tdImg = document.createElement("td");
      const img = document.createElement("img");
      const imgTrash = document.createElement("img");
      const tdName = document.createElement("td");
      const tdQtt = document.createElement("td");
      const tdPrice = document.createElement("td");
      const tdTrash = document.createElement("td");
      img.src = item.img;
      img.alt = `imagem ${item.nome}`;
      img.classList.add("imgProduct");
      tdImg.classList.add("tableImg");

      tdImg.appendChild(img);
      tdName.textContent = item.nome;
      tdName.classList.add("tableName");

      tdQtt.innerHTML = `<h3 class="m-0 sum">+</h3> ${item.quantidade} <h3 class="m-0 minus">-</h3>`;
      tdQtt.classList.add("tableQtt");
      addEventListenersToButtons(item, tdQtt, cartItens); 

      tdPrice.textContent = Number(item.valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      tdPrice.classList.add("tablePrice");
      imgTrash.src = "../../img/icons/trash.svg";
      imgTrash.alt = "icon delete";
      tdTrash.append(imgTrash);
      tdTrash.classList.add("tdRemove");
      tr.append(tdImg, tdName, tdQtt, tdPrice, tdTrash);

      document.querySelector("tbody").appendChild(tr);
      imgTrash.addEventListener("click", function () {
        const cartInfo = JSON.parse(localStorage.getItem("cart"));
        const removeItem = cartInfo.filter(
          (cartItem) => cartItem.nome !== item.nome
        );
        tr.remove();
        localStorage.setItem("cart", JSON.stringify(removeItem));
        if (!removeItem.length) {
          modal.classList.add("hidden");
        }
        getCartProducts();
      });
    });
  });
}

$.ajax({
  url: "http://localhost:8000/database.php",
  dataType: "json",
  type: "GET",
  contentType: "application/json",
  beforeSend: function () {
    if (!render) {
      response.textContent = "Carregando...";
    }
  },
})

  .done(function (data) {
    setTimeout(
      () => {
        response.textContent = "";

        for (const products of data) {
          try {
            categories.add(products.categoria);
            produtos.push(...products.produtos);
          } catch (error) {
            console.log({ error });
          }
        }
        renderProducts(produtos);

        categories.forEach((category) => {
          const categoryDiv = document.createElement("div");
          const subcategoryDiv = document.createElement("div");
          const h2 = document.createElement("h2");
          const img = document.createElement("img");
          h2.textContent = category;
          h2.classList.add(
            "m-0",
            "text-capitalize",
            "fs-5",
            "pointer",
            "red",
            "gap-3",
            "d-flex"
          );
          img.src = "../../img/icons/arrowsDown.svg";
          img.alt = "seta para baixo";
          h2.appendChild(img);
          categoryDiv.appendChild(h2);
          aside.appendChild(categoryDiv);
          subcategoryDiv.style.display = "none";

          h2.addEventListener("click", function () {
            const isCurrentlyVisible = subcategoryDiv.style.display === "block";

            subcategoryDiv.style.display = isCurrentlyVisible
              ? "none"
              : "block";
          });

          $.ajax({
            url: "../../database/categories.json",
            dataType: "json",
            type: "GET",
            contentType: "application/json",
          })
            .done(function (subcategories) {
              let categories = subcategories[0].categorias;
              for (let i = 0; i < categories.length; i++) {
                if (categories[i].tipo === category) {
                  const h2 = document.createElement("h2");
                  h2.textContent = categories[i].descrição;
                  h2.classList.add(
                    "m-0",
                    "text-capitalize",
                    "fs-6",
                    "pointer",
                    "red"
                  );

                  h2.addEventListener("click", function () {
                    const filterProducts = produtos.filter(
                      (produto) => produto.categoria === categories[i].id
                    );
                    renderProducts(filterProducts);
                  });

                  subcategoryDiv.appendChild(h2);
                  categoryDiv.appendChild(subcategoryDiv);
                }
              }
            })
            .fail(function (_, textStatus, errorThrown) {
              console.error("Error:", textStatus, errorThrown);
            });
        });
        const button = document.createElement("button");
        button.textContent = "Mostrar todos os produtos";
        button.addEventListener("click", function () {
          renderProducts(produtos);
        });
        aside.appendChild(button);
      },
      render ? 0 : 2000
    );
  })
  .fail(function (_, textStatus, errorThrown) {
    console.error("Error:", textStatus, errorThrown);
  });
