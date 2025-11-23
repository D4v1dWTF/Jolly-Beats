function updateFontSizeIndicator() {
  const currentSize = localStorage.getItem('fontSize') || 'normal';
  const sizeSmall = document.getElementById('sizeSmall');
  const sizeNormal = document.getElementById('sizeNormal');
  const sizeLarge = document.getElementById('sizeLarge');
  
  if (sizeSmall) sizeSmall.classList.remove('active');
  if (sizeNormal) sizeNormal.classList.remove('active');
  if (sizeLarge) sizeLarge.classList.remove('active');

  if (currentSize === 'small' && sizeSmall) {
    sizeSmall.classList.add('active');
  } else if (currentSize === 'large' && sizeLarge) {
    sizeLarge.classList.add('active');
  } else if (sizeNormal) {
    sizeNormal.classList.add('active');
  }
}

function toggleFontSize() {
  const body = document.body;
  const currentSize = localStorage.getItem('fontSize') || 'normal';
  let newSize;

  if (currentSize === 'normal') {
    newSize = 'large';
    body.className = body.className.replace(/font-\w+/g, '').trim() + ' font-large';
  } else if (currentSize === 'large') {
    newSize = 'small';
    body.className = body.className.replace(/font-\w+/g, '').trim() + ' font-small';
  } else {
    newSize = 'normal';
    body.className = body.className.replace(/font-\w+/g, '').trim();
  }

  localStorage.setItem('fontSize', newSize);
  updateFontSizeIndicator();
}

window.addEventListener('load', function() {
  const savedSize = localStorage.getItem('fontSize') || 'normal';
  const body = document.body;
  
  if (savedSize === 'small') {
    body.className = body.className + ' font-small';
  } else if (savedSize === 'large') {
    body.className = body.className + ' font-large';
  }
  updateFontSizeIndicator();
});

