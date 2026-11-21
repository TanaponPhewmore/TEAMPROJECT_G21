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
    renderPortfolios();
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
    renderPortfolios();
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
    fillImportDropdown();
}

// event listener for the Create portfolio button
form_portfolio.addEventListener('submit', function (event) {
    event.preventDefault();
 
    const name = document.querySelector('#portfolio-name').value.trim();
    const err = document.querySelector('#portfolio-error');
 
    if (name === '') {
        err.textContent = 'Please enter your name.';
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
        err.textContent = errors.join('\n');
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

// put text into the element that matches the selector
function setText(parent, selector, text) {
    parent.querySelector(selector).textContent = text;
}

// show every portfolio (and its items) on the page
function renderPortfolios() {
    const list = document.querySelector('#portfolio-list');
    list.innerHTML = '';

    if (all_portfolios.length === 0) {
        list.innerHTML = '<p id="empty-portfolio-message">No portfolios available yet.</p>';
        return;
    }

    all_portfolios.forEach(function (p) {
        const card = document.querySelector('#portfolio-template').content.cloneNode(true);
        setText(card, '.display-portfolio-name', p.displayName);
        setText(card, '.display-enjoy', p.whatIEnjoy);
        setText(card, '.display-tried', p.whatIveTried);
        setText(card, '.display-curious', p.whatImCuriousAbout);
        card.querySelector('.empty-item-message').hidden = p.items.length > 0;

        p.items.forEach(function (item) {
            card.querySelector('.item-list').appendChild(buildItem(item));
        });
        list.appendChild(card);
    });
}

// build one item card from the item template
function buildItem(item) {
    const el = document.querySelector('#item-template').content.cloneNode(true);
    setText(el, '.display-item-title', item.title);
    setText(el, '.display-item-type', item.type);
    setText(el, '.display-item-date', item.date);
    setText(el, '.display-item-role', item.role);
    setText(el, '.display-item-description', item.description);
    setText(el, '.display-whatIDid', item.reflection.whatIDid);
    setText(el, '.display-whatILearned', item.reflection.whatILearned);
    setText(el, '.display-challenge', item.reflection.challenge);
    setText(el, '.display-nextStep', item.reflection.nextStep);

    item.skills.forEach(function (skill) {
        const li = document.createElement('li');
        li.textContent = skill;
        el.querySelector('.display-item-skills').appendChild(li);
    });

    item.evidence.forEach(function (url) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = url;
        a.textContent = url;
        a.target = '_blank';
        a.rel = 'noopener';
        li.appendChild(a);
        el.querySelector('.display-evidence').appendChild(li);
    });
    return el;
}

const form_import = document.querySelector('#import-form');
 
// this function will fill the dropdown menu of the import with the saved portfolios, so you can select which one to add it to.
function fillImportDropdown() {
    const select = document.querySelector('#import-portfolio');
    if (select === null) {
        return;
    }
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
 
function importText(value) {
    if (typeof value === 'string') {
        return value.trim();
    }
    return '';
}
 
// reads the pasted json text into an object
function readImportedItem(text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch (error) {
        return { item: null, errors: ['This is not valid JSON. Paste the whole text exactly as you received it.'] };
    }
 
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        return { item: null, errors: ['The JSON must be ONE item that starts with { and ends with }.'] };
    }
 
    let skillsIn = data.skills;
    if (typeof skillsIn === 'string') {
        skillsIn = skillsIn.split(',');
    }
    if (Array.isArray(skillsIn) === false) {
        skillsIn = [];
    }
 
    let evidenceIn = data.evidence;
    if (typeof evidenceIn === 'string') {
        evidenceIn = [evidenceIn];
    }
    if (Array.isArray(evidenceIn) === false) {
        evidenceIn = [];
    }
 
    // reflection: must be an object with 4 parts
    const reflectionOk = data.reflection !== null && typeof data.reflection === 'object' && Array.isArray(data.reflection) === false;
    const r = reflectionOk ? data.reflection : {};
 
    const item = {
        id: '',
        title: importText(data.title),
        type: importText(data.type),
        date: importText(data.date),
        role: importText(data.role),
        description: importText(data.description),
        skills: skillsIn.map(importText).filter(function (s) {return s !== '';}),
        reflection: {
            whatIDid: importText(r.whatIDid),
            whatILearned: importText(r.whatILearned),
            challenge: importText(r.challenge),
            nextStep: importText(r.nextStep)
        },
        evidence: evidenceIn.map(importText).filter(function (u) {return u !== '';})
    };
 
    const errors = [];
    if (reflectionOk === false) {
        errors.push('Reflection must have 4 parts: whatIDid, whatILearned, challenge, nextStep.');
    }
 
    const reflectionMessages = [
        'What I did is required.',
        'What I learned is required.',
        'Challenge is required.',
        'Next step is required.'
    ];
    const found = validateItem(item);
    for (let i = 0; i < found.length; i++) {
        if (reflectionOk === false && reflectionMessages.indexOf(found[i]) !== -1) {
            continue;
        }
        if (found[i] === 'Evidence must be a URL starting with http.') {
            continue;
        }
        errors.push(found[i]);
    }
 
    if (item.date !== '' && /^\d{4}-\d{2}-\d{2}$/.test(item.date) === false) {
        errors.push('Date must look like 2026-11-24 (YYYY-MM-DD).');
    }
 
    if (item.evidence.length === 0) {
        errors.push('Evidence is required (a link starting with http:// or https://).');
    } else {
        for (let i = 0; i < item.evidence.length; i++) {
            if (item.evidence[i].startsWith('http://') === false && item.evidence[i].startsWith('https://') === false) {
                errors.push('Evidence must be a link starting with http:// or https:// (a file name like result.png is not a link).');
                break;
            }
        }
    }
 
    return { item: item, errors: errors };
}
 
// function for the import button
form_import.addEventListener('submit', function (event) {
    event.preventDefault();
 
    const err = document.querySelector('#import-error');
    const done = document.querySelector('#import-success');
    const portfolioId = document.querySelector('#import-portfolio').value;
    const text = document.querySelector('#import-json').value.trim();
 
    err.textContent = '';
    done.textContent = '';
 
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
 
    if (text === '') {
        err.textContent = 'Please paste the Portfolio Item JSON.';
        return;
    }
 
    const result = readImportedItem(text);
    if (result.errors.length > 0) {
        err.textContent = result.errors.join('\n');
        return;
    }
 
    // the item json doesnt require to have id. its made here 
    result.item.id = 'item' + String(portfolio.items.length + 1).padStart(3, '0');
 
    portfolio.items.push(result.item);
    if (savePortfolios() === false) {
        portfolio.items.pop();
        err.textContent = 'Could not save. Please try again.';
        return;
    }
 
    form_import.reset();
    document.querySelector('#import-portfolio').value = portfolioId;
    done.textContent = 'Imported "' + result.item.title + '" into ' + portfolio.displayName + '.';
});
