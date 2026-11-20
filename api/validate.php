<?php
// api/validate.php
// The server checks everything again, even if the browser already checked it.

// Trim a value, drop control characters, and return '' if it is not plain text.
function cleanText($value) {
    if (!is_string($value)) {
        return '';
    }
    $value = trim($value);
    if (!preg_match('//u', $value)) {          // not valid UTF-8
        return '';
    }
    return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);
}

// Number of characters (Thai letters count as 1 each).
function textLength($text) {
    return preg_match_all('/./su', $text);
}

// YYYY-MM-DD and a date that really exists (2026-02-30 is rejected).
function isValidDate($text) {
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $text, $m)) {
        return false;
    }
    return checkdate((int) $m[2], (int) $m[3], (int) $m[1]);
}

// A real web link that starts with http:// or https://
function isValidUrl($text) {
    if (filter_var($text, FILTER_VALIDATE_URL) === false) {
        return false;
    }
    $scheme = strtolower(parse_url($text, PHP_URL_SCHEME) ?? '');
    return $scheme === 'http' || $scheme === 'https';
}

// Read one text field, check "required" and the maximum length, add a message to $errors.
function textField($value, $label, $max, $required, &$errors) {
    $text = cleanText($value);
    if ($required && $text === '') {
        $errors[] = $label . ' is required.';
    } elseif (textLength($text) > $max) {
        $errors[] = $label . ' must be at most ' . $max . ' characters.';
    }
    return $text;
}

// Check a new portfolio. Returns [cleaned fields, list of error messages].
function validatePortfolio($in) {
    $errors = [];
    $data = [
        'displayName'        => textField($in['displayName'] ?? '', 'Display name', 100, true, $errors),
        'whatIEnjoy'         => textField($in['whatIEnjoy'] ?? '', 'What I enjoy', 500, false, $errors),
        'whatIveTried'       => textField($in['whatIveTried'] ?? '', 'What I\'ve tried', 500, false, $errors),
        'whatImCuriousAbout' => textField($in['whatImCuriousAbout'] ?? '', 'What I\'m curious about', 500, false, $errors),
    ];
    return [$data, $errors];
}

// Check a new item. Accepts form fields (skills = "HTML, CSS") or a JSON item (skills = array).
// Returns [cleaned item in the Contract shape, list of error messages].
function validateItem($in) {
    $errors = [];

    $title       = textField($in['title'] ?? '', 'Title', 100, true, $errors);
    $type        = textField($in['type'] ?? '', 'Type', 50, true, $errors);
    $role        = textField($in['role'] ?? '', 'Role', 100, true, $errors);
    $description = textField($in['description'] ?? '', 'Description', 1000, true, $errors);

    $date = cleanText($in['date'] ?? '');
    if ($date === '') {
        $errors[] = 'Date is required.';
    } elseif (!isValidDate($date)) {
        $errors[] = 'Date must be a real date in YYYY-MM-DD format.';
    }

    // skills: "HTML, CSS" (form) or ["HTML", "CSS"] (JSON) -> array
    $skillsIn = $in['skills'] ?? [];
    if (is_string($skillsIn)) {
        $skillsIn = explode(',', $skillsIn);
    }
    if (!is_array($skillsIn)) {
        $skillsIn = [];
    }
    $skills = [];
    foreach ($skillsIn as $skill) {
        $skill = cleanText($skill);
        if ($skill === '') {
            continue;
        }
        if (textLength($skill) > 50) {
            $errors[] = 'Each skill must be at most 50 characters.';
            break;
        }
        $skills[] = $skill;
    }
    if (count($skills) === 0) {
        $errors[] = 'Add at least one skill.';
    } elseif (count($skills) > 20) {
        $errors[] = 'Add at most 20 skills.';
    }

    // reflection: nested object (JSON) or four top-level fields (form)
    $r = (isset($in['reflection']) && is_array($in['reflection'])) ? $in['reflection'] : $in;
    $reflection = [
        'whatIDid'     => textField($r['whatIDid'] ?? '', 'What I did', 1000, true, $errors),
        'whatILearned' => textField($r['whatILearned'] ?? '', 'What I learned', 1000, true, $errors),
        'challenge'    => textField($r['challenge'] ?? '', 'Challenge', 1000, true, $errors),
        'nextStep'     => textField($r['nextStep'] ?? '', 'Next step', 1000, true, $errors),
    ];

    // evidence: one link (form) or a list of links (JSON) -> array of http(s) links
    $evidenceIn = $in['evidence'] ?? [];
    if (is_string($evidenceIn)) {
        $evidenceIn = [$evidenceIn];
    }
    if (!is_array($evidenceIn)) {
        $evidenceIn = [];
    }
    $evidence = [];
    $evidenceBad = false;
    foreach ($evidenceIn as $url) {
        $url = cleanText($url);
        if ($url === '') {
            continue;
        }
        if (textLength($url) > 500 || !isValidUrl($url)) {
            $evidenceBad = true;
            break;
        }
        $evidence[] = $url;
    }
    if ($evidenceBad) {
        $errors[] = 'Evidence must be a valid web link starting with http:// or https://.';
    } elseif (count($evidence) === 0) {
        $errors[] = 'Evidence is required (a link starting with http:// or https://).';
    } elseif (count($evidence) > 5) {
        $errors[] = 'Add at most 5 evidence links.';
    }

    $item = [
        'title'       => $title,
        'type'        => $type,
        'date'        => $date,
        'role'        => $role,
        'description' => $description,
        'skills'      => $skills,
        'reflection'  => $reflection,
        'evidence'    => $evidence,
    ];
    return [$item, $errors];
}