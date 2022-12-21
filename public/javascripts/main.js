// fade out for flash messages
setTimeout(function () {
  $("#flash-msg").fadeOut("slow");
}, 3000);

setTimeout(function () {
  $("#success").fadeOut("slow");
}, 3000);

setTimeout(function () {
  $("#error").fadeOut("slow");
}, 3000);

window.onload = function(){
  slideOne();
  slideTwo();
}

let sliderOne = document.getElementById("slider-1");
let sliderTwo = document.getElementById("slider-2");
let displayValOne = document.getElementById("range1");
let displayValTwo = document.getElementById("range2");
let minGap = 0;
let sliderTrack = document.querySelector(".slider-track");
let sliderMaxValue = document.getElementById("slider-1").max;
let filterProduct = document.getElementById("filterProduct")
let paginationNav = document.getElementById("pagination-nav")
let searchInput = document.getElementsByClassName("search-input")
let sort = document.getElementById("sort-by");

function slideOne(){
  if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
      sliderOne.value = parseInt(sliderTwo.value) - minGap;
  }
  displayValOne.value = sliderOne.value;
  fillColor();
}
function slideTwo(){
  if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
      sliderTwo.value = parseInt(sliderOne.value) + minGap;
  }
  displayValTwo.value = sliderTwo.value;
  fillColor();
}
function fillColor(){
  percent1 = (sliderOne.value / sliderMaxValue) * 100;
  percent2 = (sliderTwo.value / sliderMaxValue) * 100;
  sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , var(--dark-teal) ${percent1}% , var(--dark-teal) ${percent2}%, #dadae5 ${percent2}%)`;
}

function fetData(current, slug){
  let url = `http://localhost:3000` + slug + `page=${current}&max=${displayValTwo.value}&min=${displayValOne.value}&column=${sort.value.substring(0,sort.value.indexOf('-'))}&sort=${sort.value.substring(sort.value.indexOf('-')+1)}`
  console.log(url)
  sliderTwo.value = displayValTwo.value 
  sliderOne.value = displayValOne.value
  fillColor()
  fetch(url)
  .then((response) => response.json())
  .then((data) => {
    //console.log(data)
      let change = ""
      data.allProducts.forEach(product => {
          change+= `<div class="col-lg-3 col-md-4 col-sm-6 col-xs-12 product-index-box">
          <div class="single-product d-flex flex-column h-100">
            <a
              class="title-link"
              href="/products/${product.category.slug}/${product._id}"
            >
              <img src="${product.imagePath}" alt="Bag" class="img-fluid"
            /></a>
            <div class="product-info">
              <a
                class="title-link"
                href="/products/${product.category.slug}/${product._id}"
              >
                <h6 class="mt-2 mb-2">${product.title}</h6></a
              >
              <div class="price">$${product.price}</div>
            </div>`
            if(product.available) {
              change+=`<a
              href="/add-to-cart/${product._id}"
              class="btn btn-block btn-secondary button-style mt-auto mb-2"
            >
              Add to Shopping Cart
            </a>
            </div>
            </div>`
             } else { 
              change+=`<a
                        href="#"
                        class="btn btn-block btn-danger button-style-danger mt-2 mb-2"
                      >
                        Sold out
                      </a>
                    </div>
                  </div>`
            } 
            
      });
      filterProduct.innerHTML = change

      //PAGINATION
      let pagination = ``
      if (current == 1) { 
        pagination+= `<li class="page-item disabled"><a class="page-link">First</a></li>`
      } 
      else { 
        pagination+=`
          <li class="page-item">
            <a class="page-link" onclick = "fetData(1,'${slug}')">First</a>
          </li>`
      } 
      let i = (Number(current) > 5 ? Number(current) - 4 : 1) 
      if (i!== 1) { 
        pagination+=`<li class="page-item disabled"><a class="page-link">...</a></li>`
      } 
      for (; i <= (Number(current) + 4) && i <= data.pages; i++) { 
          if (i== current) { 
            pagination+=`<li class="page-item active"><a class="page-link">${i}</a></li>`
          } 
          else { 
            pagination+=`
              <li class="page-item">
                <a class="page-link" onclick = "fetData(${i},'${slug}')">${i}</a>
              </li>`
          }  
          if (i == Number(current) + 4 && i < data.pages) { 
            pagination+=`<li class="page-item disabled"><a class="page-link">...</a></li>`
          } 
      }  
      if (current == data.pages) { 
        pagination+=`<li class="page-item disabled"><a class="page-link">Last</a></li>`
      } 
      else {
        pagination+=`
          <li class="page-item">
            <a class="page-link" onclick = "fetData(${data.pages},'${slug}')">Last</a>
          </li>`
      }
      paginationNav.innerHTML = pagination

  });
}



