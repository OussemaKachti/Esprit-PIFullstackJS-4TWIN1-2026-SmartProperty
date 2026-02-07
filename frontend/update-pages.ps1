# PowerShell script to update all pages with proper React structure
$pagesDir = "src\pages"
$pages = Get-ChildItem "$pagesDir\*.jsx" -Name

# Skip AboutUs.jsx as it's already updated
$pagesToUpdate = $pages | Where-Object { $_ -ne "AboutUs.jsx" }

foreach ($page in $pagesToUpdate) {
    $filePath = "$pagesDir\$page"
    Write-Host "Updating $page..."
    
    # Read the file content
    $content = Get-Content $filePath -Raw
    
    # Extract component name from filename (without .jsx extension)
    $componentName = [System.IO.Path]::GetFileNameWithoutExtension($page)
    
    # Update imports and add useEffect
    $content = $content -replace "import React from 'react';", "import React, { useEffect } from 'react';"
    
    # Update component declaration and add useEffect hook
    $useEffectCode = @"
  useEffect(() => {
    // Force enable scrolling
    const enableScrolling = () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.classList.remove('no-scroll', 'modal-open', 'overflow-hidden');
      document.documentElement.classList.remove('no-scroll', 'modal-open', 'overflow-hidden');
    };
    enableScrolling();

    // Initialize plugins
    const initializePlugins = () => {
      enableScrolling();
      if (window.AOS) {
        window.AOS.refresh();
        window.AOS.init({ duration: 1200, once: true });
      }
      if (window.jQuery && window.jQuery.fn.select2) {
        window.jQuery('.select2').select2({ minimumResultsForSearch: -1 });
      }
      if (window.jQuery) {
        window.jQuery('#mobile_btn').off('click').on('click', function() {
          window.jQuery('.main-menu-wrapper').addClass('open');
        });
        window.jQuery('#menu_close').off('click').on('click', function() {
          window.jQuery('.main-menu-wrapper').removeClass('open');
        });
        window.jQuery('.has-submenu > a').off('click').on('click', function(e) {
          if (window.jQuery(window).width() < 992) {
            e.preventDefault();
            window.jQuery(this).parent().toggleClass('open');
            window.jQuery(this).parent().find('.submenu').first().slideToggle();
          }
        });
      }
    };
    const timer = setTimeout(initializePlugins, 300);
    return () => clearTimeout(timer);
  }, []);

"@
    
    # Replace the return statement pattern
    $content = $content -replace "const $componentName = \(\) => \{\s*return \(\s*<>", "const $componentName = () => {`n$useEffectCode`n  return (`n    <div style={{ `n      minHeight: '100vh', `n      overflow: 'visible',`n      position: 'relative',`n      width: '100%'`n    }}>"
    
    # Replace the closing pattern
    $content = $content -replace "\s*</>\s*\);", "`n    </div>`n  );"
    
    # Write back to file
    Set-Content $filePath $content -Encoding UTF8
    
    Write-Host "Updated $page successfully"
}

Write-Host "All pages updated with proper React structure!"