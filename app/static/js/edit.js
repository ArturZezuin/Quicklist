let listID = 0
let sTimer
const inputListName = document.getElementById('inputListName');
const inputSearchProduct = document.getElementById('inputSearchProduct')
const foundProductList = document.getElementById('foundProductList')
const listItems = document.getElementById('listItems')
const addItemModal = document.getElementById('addItemModal')

document.addEventListener('DOMContentLoaded', function () {
    getListId()
    sortListItems()
    const list_elements = document.querySelectorAll('[id-list-item]')
    list_elements.forEach(element => {
        const element_id = element.getAttribute('id-list-item')
        element.addEventListener('click', function() {
            markListItem(element_id)
        })
        const span = element.querySelector('span')
        span.addEventListener('click', function() {
            deleteListItem(element_id)
        })
    })

})

inputListName.addEventListener('change', (event) =>{
    updateListName()
})

addItemModal.addEventListener('show.bs.modal', (event) => {
    inputSearchProduct.value = ''
    foundProductList.innerHTML = ''
})

addItemModal.addEventListener('shown.bs.modal', (event) => {
    inputSearchProduct.focus()
})

inputSearchProduct.addEventListener('input', (event) =>{
    searchProduct()
})

async function addListItemToDB(id_product, title){
    const response = await fetch('/addlistitem', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'id_list': listID,
            'id_product': id_product,
            'title': title,
        })
    });

    if (!response.ok) { throw new Error(`Err (addItemToList): ${response.status} - ${response.error}`) }

    return await response.json()
}

function sortListItems(){
    const list = document.getElementById('listItems')
    const items = Array.from(list.getElementsByTagName('li'))
    items.sort((a, b) => {
        const markedA = a.getAttribute('is-marked')
        const markedB = b.getAttribute('is-marked')
        return markedA - markedB
    })
    list.innerHTML = ''
    items.forEach(item => {
        const marked = item.getAttribute('is-marked')
        if(marked == 0) {
            item.classList.add('list-group-item-primary')
        } else {
            item.classList.remove('list-group-item-primary')    
        }
        list.appendChild(item)
    })
}

async function markListItemDB(id, marker) {
    const response = await fetch('/marklistitem', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'id':id, 'marker':marker})
    });

    if (!response.ok) { throw new Error(`Err (marklistitem): ${response.status} - ${response.error}`) }  
}

function markListItem(list_item_id){
    let marker
    const list_element = document.querySelector(`[id-list-item="${list_item_id}"]`)  
    if(list_element) {
        const marked = list_element.getAttribute('is-marked')
        const list_id = list_element.getAttribute('id-list-item')
        if(marked == 0) {
            marker = 1
            list_element.setAttribute('is-marked', marker)
        } else {
            marker = 0
            list_element.setAttribute('is-marked', marker)
        }
        markListItemDB(list_id, marker)
        sortListItems()
        list_element.focus()
    } 
}

async function deleteListItem(id) {
    const response = await fetch('/deletelistitem', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(id)
    });

    if (!response.ok) { throw new Error(`Err (deleteListItem): ${response.status} - ${response.error}`) }  
    
    const list_element = document.querySelector(`[id-list-item="${id}"]`)
    if (list_element) {
        list_element.remove()   
    }
}

async function addProductToList(id, title){
    result = await addListItemToDB(id, title)
    if(!result) {
        console.log('Err (addProductToList)')
    } else {
        const list_element = document.querySelector(`[id-list-item="${id}"]`)
        if (!list_element) {
            const li = document.createElement('li')
            const div = document.createElement('div')
            const span = document.createElement('span')
            const a = document.createElement('a')
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center')
            li.setAttribute('id-list-item', result.list_item_id)
            li.setAttribute('id-product', result.id_product)
            li.setAttribute('is-marked', 0)
            li.style = 'cursor:pointer;'
            li.addEventListener('click', () => {
                markListItem(result.list_item_id)
            })
            div.classList.add('flex-grow-1', 'fs-5') 
            div.textContent = title
            span.classList.add('badge', 'text-bg-danger', 'rounded-pill', 'ms-2') 
            span.textContent = 'X'
            span.addEventListener('click', () => {
                deleteListItem(result.list_item_id)
            })
            li.appendChild(div)
            li.appendChild(span)
            listItems.appendChild(li)
        }
        inputSearchProduct.value = ''
        inputSearchProduct.focus()
        sortListItems()
        markBadge()
    }
}

function markBadge() {
    const elements = document.querySelectorAll('[badge-product-id]');
    elements.forEach(element => {
        const element_id = element.getAttribute('badge-product-id')
        const list_element = document.querySelector(`[id-product="${element_id}"]`) 
        element.classList.remove('text-bg-success') 
        element.classList.remove('text-bg-secondary') 
        if (list_element) {
            element.classList.add('text-bg-success') 
        } else {
            element.classList.add('text-bg-secondary') 
        }
    })   
}

function addBadgeProduct(id, title){
    const span = document.createElement('span');
    const element = document.querySelector(`[id-product="${id}"]`)
    if(element) {
        span.classList.add('text-bg-success')
    } else {
        span.classList.add('text-bg-secondary')
    }
    span.classList.add('badge', 'p-3','m-1')
    span.setAttribute('badge-product-id', id)
    span.style = 'cursor:pointer;'
    span.textContent = title;
    span.onclick = function() { 
        addProductToList(id, title)
    }
    foundProductList.appendChild(span);    
}

async function searchProduct(){
    delay(300).then(() => {
        fetch('/searchproduct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'title': inputSearchProduct.value })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка запроса: ${response.status} - ${response.error}`);
            }
            return response.json()
        })
        .then(product_list => {
            foundProductList.innerHTML = '';

            const product = product_list.find(product => product.title === inputSearchProduct.value);
            if (!product) {
                addBadgeProduct(0, inputSearchProduct.value)
            }

            product_list.forEach(product => {
                addBadgeProduct(product.id, product.title)
            });
        })
        .catch(error => {
            console.error('Err (updateListName):', error)
        });
    });
}

async function updateListName(){
    try {
        const response = await fetch('/updatelistname', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({'id': listID, 'name': inputListName.value})
        });
    } catch (error) {
        console.error('Err (updateListName):', error)
    }
}

function getListId(){
    let url = window.location.pathname;
    let parts = url.split('/');
    let number = parts[2];
    if (!isNaN(number) && number.trim() !== "") {
        listID = number 
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}