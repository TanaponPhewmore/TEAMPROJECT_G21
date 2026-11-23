const form_portfolio = document.querySelector('#portfolio-form');
 
// this array contains all the portfolios
let all_portfolios = [];
 
// load the saved portfolios into all_portfolios
async function loadPortfolios() {
    try {
        const response = await fetch('api/portfolios.php');

        if (!response.ok) {
            throw new Error('Could not load portfolios.');
        }

        all_portfolios = await response.json();


    } catch (error) {
        console.error('Could not load portfolios:', error);
    }
    fillDropdown();
    renderPortfolios();
}

loadPortfolios();

// this function is for filling the dropdown menu with the portfolios
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

form_portfolio.addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.querySelector('#portfolio-name').value.trim();
    const err = document.querySelector('#portfolio-error');

    if (name === '') {
        err.textContent = 'Please enter your name.';
        return;
    }

    err.textContent = '';

    const portfolioData = {
        displayName: name,
        whatIEnjoy: document.querySelector('#portfolio-enjoy').value.trim(),
        whatIveTried: document.querySelector('#portfolio-tried').value.trim(),
        whatImCuriousAbout: document.querySelector('#portfolio-curious').value.trim()
    };

    try {
        const response = await fetch('api/portfolios.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(portfolioData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Could not create portfolio.');
        }

        all_portfolios.push(result);

        fillDropdown();
        renderPortfolios();

        document.querySelector('#target-portfolio').value = result.id;
        form_portfolio.reset();

    } catch (error) {
        console.error('Could not create portfolio:', error);
        err.textContent = error.message;
    }
});


// build an item object from the form fields
const form_item = document.querySelector('#item-form');


function createItem() {
    return {
        title: document.querySelector('#item-title').value.trim(),
        type: document.querySelector('#item-type').value.trim(),
        date: document.querySelector('#item-date').value,
        role: document.querySelector('#item-role').value.trim(),
        description: document.querySelector('#item-description').value.trim(),

        skills: document.querySelector('#item-skills').value
            .split(',')
            .map(function (s) {
                return s.trim();
            })
            .filter(function (s) {
                return s !== '';
            }),

        reflection: {
            whatIDid: document.querySelector('#item-whatIDid').value.trim(),
            whatILearned: document.querySelector('#item-whatILearned').value.trim(),
            challenge: document.querySelector('#item-challenge').value.trim(),
            nextStep: document.querySelector('#item-nextStep').value.trim()
        },

        evidence: [
            document.querySelector('#item-evidence').value.trim()
        ]
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

form_item.addEventListener('submit', async function (event) {
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

    const item = createItem();
    const errors = validateItem(item);

    if (errors.length > 0) {
        err.textContent = errors.join('\n');
        return;
    }

    err.textContent = '';

    try {
        const response = await fetch('api/items.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                portfolioId: portfolioId,
                ...item
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Could not add item.');
        }

        portfolio.items.push(result);

        fillDropdown();
        renderPortfolios();

        form_item.reset();
        document.querySelector('#target-portfolio').value = portfolioId;

    } catch (error) {
        console.error('Could not add item:', error);
        err.textContent = error.message;
    }
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
        card.querySelector('.export-btn').addEventListener('click', function () {
        exportPortfolio(p);
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

// download one portfolio as a .json file
function exportPortfolio(portfolio) {
    const json = JSON.stringify(portfolio, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-portfolio.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
 
// makes one text from the content of an item (without the id), used to find the same item twice
function itemKey(item) {
    return JSON.stringify([
        item.title, item.type, item.date, item.role, item.description,
        item.skills,
        item.reflection.whatIDid, item.reflection.whatILearned,
        item.reflection.challenge, item.reflection.nextStep,
        item.evidence
    ]);
}

// function for the import button
form_import.addEventListener('submit', async function (event) {
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
 
    pendingImport = result.item;
    document.querySelector('#import-review-title').textContent = result.item.title;
    document.querySelector('#import-review-info').textContent =
        result.item.type + ' | ' + result.item.date + ' | will be saved in ' + portfolio.displayName;
    document.querySelector('#import-whatIDid').value = result.item.reflection.whatIDid;
    document.querySelector('#import-whatILearned').value = result.item.reflection.whatILearned;
    document.querySelector('#import-challenge').value = result.item.reflection.challenge;
    document.querySelector('#import-nextStep').value = result.item.reflection.nextStep;

    const evidenceList = document.querySelector('#import-evidence-list');
    evidenceList.innerHTML = '';
    for (let i = 0; i < result.item.evidence.length; i++) {
        const li = document.createElement('li');
        li.textContent = result.item.evidence[i];
        evidenceList.appendChild(li);
    }
    document.querySelector('#import-review').hidden = false;

});

let pendingImport = null;

document.querySelector('#btn-import-save').addEventListener('click', async function () {
    const err = document.querySelector('#import-error');
    const done = document.querySelector('#import-success');
    err.textContent = '';
    done.textContent = '';

    if (pendingImport === null) {
        return;
    }

    const portfolioId = document.querySelector('#import-portfolio').value;
    const portfolio = all_portfolios.find(function (p) {
        return p.id === portfolioId;
    });
    if (portfolio === undefined) {
        err.textContent = 'Please select a portfolio.';
        return;
    }

    const item = {
        ...pendingImport,
        reflection: {
            whatIDid: document.querySelector('#import-whatIDid').value.trim(),
            whatILearned: document.querySelector('#import-whatILearned').value.trim(),
            challenge: document.querySelector('#import-challenge').value.trim(),
            nextStep: document.querySelector('#import-nextStep').value.trim()
        }
    };

    const problems = validateItem(item);
    if (problems.length > 0) {
        err.textContent = problems.join('\n');
        return;
    }

    const newKey = itemKey(item);
    const alreadyThere = portfolio.items.some(function (existing) {
        return itemKey(existing) === newKey;
    });
    if (alreadyThere) {
        err.textContent = 'This item is already in this portfolio.';
        return;
    }

    try {
        const response = await fetch('api/items.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ portfolioId: portfolioId, import: true, ...item })
        });
        const saved = await response.json();
        if (!response.ok) {
            throw new Error(saved.error || 'Could not import the item.');
        }

        portfolio.items.push(saved);
        fillDropdown();
        renderPortfolios();

        pendingImport = null;
        form_import.reset();
        document.querySelector('#import-review').hidden = true;
        document.querySelector('#import-portfolio').value = portfolioId;
        done.textContent = 'Imported "' + saved.title + '" into ' + portfolio.displayName + '.';
    } catch (error) {
        console.error('Could not import item:', error);
        err.textContent = error.message;
    }
});

form_import.addEventListener('reset', function () {
    pendingImport = null;
    document.querySelector('#import-review').hidden = true;
});

// Create a variable to store the challenge that the user is currently working on.
let currentChallenge = {
    title: 'Test Challenge',
    description: 'A test description',
    evidencePrompt: 'Attach a link to your work'
};

// Runs when the user clicks "Done, save as Portfolio Item".
// Pre-fills the add-item form with data from the current Challenge.
function startItemFromChallenge() {
    // No Challenge is open, so there is nothing to fill in
    if (currentChallenge === null) {
        return;
    }

    document.querySelector('#item-title').value = currentChallenge.title;
    document.querySelector('#item-type').value = 'Challenge';
    document.querySelector('#item-date').value = new Date().toLocaleDateString('en-CA');
    document.querySelector('#item-description').value = currentChallenge.description;
    document.querySelector('#item-evidence').placeholder = currentChallenge.evidencePrompt;

    // Bring the form into view so the user can fill in the remaining fields
    form_item.scrollIntoView({ behavior: 'smooth' });
}

const btnDoChallenge = document.querySelector('#btn-do-challenge');
if (btnDoChallenge !== null) {
    btnDoChallenge.addEventListener('click', startItemFromChallenge);
}