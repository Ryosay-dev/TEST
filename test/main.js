const text = document.getElementById('text');
const btn = document.getElementById('btn');
const list = document.getElementById('list');

btn.addEventListener('click', () => {
    const li = document.createElement('li');
    li.textContent = text.value;
    list.appendChild(li);
    saveList();
})


const getList = () => {
    const lis = list.querySelectorAll('li');
    const result = [];
    for (const li of lis) {
        result.push(li.textContent);
    }
    return result;
}

const saveList = () => {
    const data = getList();
    localStorage.setItem('test_data', JSON.stringify(data));
}

const loadList = () => {
    const dataStr = localStorage.getItem('test_data');
    const data = JSON.parse(dataStr);
    for (const item of data) {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
    }
}

loadList();