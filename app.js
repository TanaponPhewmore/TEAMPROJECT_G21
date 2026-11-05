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

// build an item object from the form fields
const form_item = document.querySelector('#item-form');

function createItem(portfolio) {
    return {
        id: 'item' + String(portfolio.items.length + 1).padStart(3, '0'),
        title: document.querySelector('#item-title').value.trim(),
        type: document.querySelector('#item-type').value.trim(),
        date: document.querySelector('#item-date').value,
        role: document.querySelector('#item-role').value.trim(),
        description: document.querySelector('#item-description').value.trim(),
        skills: document.querySelector('#item-skills').value.split(',').map(function (s) {return s.trim();}).filter(function (s) {return s !== '';}),

        reflection: {
            whatIDid: document.querySelector('#item-whatIDid').value.trim(),
            whatILearned: document.querySelector('#item-whatILearned').value.trim(),
            challenge: document.querySelector('#item-challenge').value.trim(),
            nextStep: document.querySelector('#item-nextStep').value.trim()
        },

        evidence: [document.querySelector('#item-evidence').value.trim()]
    };
}

// returns a list of error messages
function validateItem(item) {
    const errors = [];
    if (item.title === '') errors.push('Title is required.');
    if (item.type === '') errors.push('Type is required.');
    if (item.date === '') errors.push('Date is required.');
    if (item.role === '') errors.push('Role is required.');
    if (item.description === '') errors.push('Description is required.');
    if (item.skills.length === 0) errors.push('Add at least one skill.');
    if (item.reflection.whatIDid === '') errors.push('What I did is required.');
    if (item.reflection.whatILearned === '') errors.push('What I learned is required.');
    if (item.reflection.challenge === '') errors.push('Challenge is required.');
    if (item.reflection.nextStep === '') errors.push('Next step is required.');
    if (item.evidence.length === 0 || !item.evidence[0].startsWith('http')) {
        errors.push('Evidence must be a URL starting with http.');
    }
    return errors;
}

// runs when the user clicks "Add portfolio item"
form_item.addEventListener('submit', function (event) {
    event.preventDefault();

    const err = document.querySelector('#item-error');
    const portfolioId = document.querySelector('#target-portfolio').value;

    if (portfolioId === '') {
        err.textContent = 'Please select a portfolio.';
        return;
    }

    const portfolio = all_portfolios.find(function (p) {
        return p.id === portfolioId;
    });
    
    if (portfolio === undefined) {
        err.textContent = 'Selected portfolio was not found.';
        return;
    }

    const item = createItem(portfolio);
    const errors = validateItem(item);
    if (errors.length > 0) {
        err.textContent = errors.join(' ');
        return;
    }
    err.textContent = '';

    portfolio.items.push(item);
    if (savePortfolios() === false) {
        portfolio.items.pop();
        err.textContent = 'Could not save. Please try again.';
        return;
    }

    form_item.reset();
    document.querySelector('#target-portfolio').value = portfolioId;
});

