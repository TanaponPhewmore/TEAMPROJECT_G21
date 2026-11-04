const form_portfolio = document.querySelector('#portfolio-form');
const STORAGE_KEY = 'portfolios';
 
// this array contains all the portfolios, dont forget to call savePortfolios() after you mutate anything in this array
let all_portfolios = [];
 
// load the saved portfolios into all_portfolios
const savedData = localStorage.getItem(STORAGE_KEY);
if (savedData !== null) {
    try {
        const savedPortfolios = JSON.parse(savedData);
        if (Array.isArray(savedPortfolios)) {
            all_portfolios = savedPortfolios;
        }
    } catch (error) {
        console.error('Could not restore the saved Portfolios:', error);
    }

    fillDropdown();
}
 
// this function should be called after you pushed something new to all_portfolios or mutate any of its values
function savePortfolios() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all_portfolios));
    } catch (error) {
        console.error('Could not save the Portfolios:', error);
        return false;
    }

    fillDropdown();
    return true;
}

// this function is for filling the dropdown menu with the portfolios saved in local storage
function fillDropdown() {
    const select = document.querySelector('#target-portfolio');
    const chosen = select.value;
    select.innerHTML = '<option value="">Choose a portfolio</option>';
    for (let i = 0; i < all_portfolios.length; i++) {
        const option = document.createElement('option');
        option.value = all_portfolios[i].id;
        option.textContent = all_portfolios[i].displayName;
        select.appendChild(option);
    }
    select.value = chosen;
}

// event listener for the Create portfolio button
form_portfolio.addEventListener('submit', function (event) {
    event.preventDefault();
 
    const name = document.querySelector('#portfolio-name').value.trim();
    const err = document.querySelector('#portfolio-error');
 
    if (name === '') {
        err.textContent = 'Please, enter your name.';
        return;
    }
 
    err.textContent = '';
 
    const portfolio = {
        id: 'portfolio' + String(all_portfolios.length + 1).padStart(3, '0'),
        displayName: name,
        whatIEnjoy: document.querySelector('#portfolio-enjoy').value.trim(),
        whatIveTried: document.querySelector('#portfolio-tried').value.trim(),
        whatImCuriousAbout: document.querySelector('#portfolio-curious').value.trim(),
        items: []
    };
 
    all_portfolios.push(portfolio);
 
    if (savePortfolios() === false) {
        all_portfolios.pop();
        err.textContent = 'Could not save. Please try again.';
        return;
    }
 
    document.querySelector('#target-portfolio').value = portfolio.id;
    form_portfolio.reset();
});