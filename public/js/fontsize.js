function toggleFontSize() {
  const body = document.body;
  const currentSize = localStorage.getItem('fontSize') || 'normal';
  let newSize;

  if (currentSize === 'normal') {
    newSize = 'large';
    body.className = body.className.replace(/font-\w+/g, '').trim() + ' font-large';
  } else if (currentSize === 'large') {
    newSize = 'xlarge';
    body.className = body.className.replace(/font-\w+/g, '').trim() + ' font-xlarge';
  } else if (currentSize === 'xlarge') {
    newSize = 'small';
    body.className = body.className.replace(/font-\w+/g, '').trim() + ' font-small';
  } else {
    newSize = 'normal';
    body.className = body.className.replace(/font-\w+/g, '').trim();
  }

  localStorage.setItem('fontSize', newSize);
}

window.addEventListener('load', function() {
  const savedSize = localStorage.getItem('fontSize') || 'normal';
  const body = document.body;
  
  if (savedSize === 'small') {
    body.className = body.className + ' font-small';
  } else if (savedSize === 'large') {
    body.className = body.className + ' font-large';
  } else if (savedSize === 'xlarge') {
    body.className = body.className + ' font-xlarge';
  }
});

