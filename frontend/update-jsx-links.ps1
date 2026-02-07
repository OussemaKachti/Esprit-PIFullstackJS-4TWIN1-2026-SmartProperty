# Update all JSX files to use React Router Links

$pagesDir = "src\pages"
$jsxFiles = Get-ChildItem -Path $pagesDir -Filter "*.jsx"

Write-Host "Updating React Router links in $($jsxFiles.Count) files..."

# Mapping of HTML files to routes
$routeMap = @{
    'index.html' = '/'
    'index-2.html' = '/index-2'
    'index-3.html' = '/index-3'
    'about-us.html' = '/about-us'
    'contact-us.html' = '/contact-us'
    'buy-property-grid.html' = '/buy-property-grid'
    'buy-property-list.html' = '/buy-property-list'
    'buy-property-grid-sidebar.html' = '/buy-property-grid-sidebar'
    'buy-property-list-sidebar.html' = '/buy-property-list-sidebar'
    'buy-grid-map.html' = '/buy-grid-map'
    'buy-list-map.html' = '/buy-list-map'
    'buy-details.html' = '/buy-details'
    'rent-property-grid.html' = '/rent-property-grid'
    'rent-property-list.html' = '/rent-property-list'
    'rent-property-grid-sidebar.html' = '/rent-property-grid-sidebar'
    'rent-property-list-sidebar.html' = '/rent-property-list-sidebar'
    'rent-grid-map.html' = '/rent-grid-map'
    'rent-list-map.html' = '/rent-list-map'
    'rent-details.html' = '/rent-details'
    'agent-grid.html' = '/agent-grid'
    'agent-list.html' = '/agent-list'
    'agent-grid-sidebar.html' = '/agent-grid-sidebar'
    'agent-list-sidebar.html' = '/agent-list-sidebar'
    'agent-details.html' = '/agent-details'
    'agency-grid.html' = '/agency-grid'
    'agency-list.html' = '/agency-list'
    'agency-grid-sidebar.html' = '/agency-grid-sidebar'
    'agency-list-sidebar.html' = '/agency-list-sidebar'
    'agency-details.html' = '/agency-details'
    'blog-grid.html' = '/blog-grid'
    'blog-list.html' = '/blog-list'
    'blog-details.html' = '/blog-details'
    'signin.html' = '/login'
    'signup.html' = '/signup'
    'forgot-password.html' = '/forgot-password'
    'reset-password.html' = '/reset-password'
    'pricing.html' = '/pricing'
    'faq.html' = '/faq'
    'gallery.html' = '/gallery'
    'our-team.html' = '/our-team'
    'testimonial.html' = '/testimonial'
    'terms-condition.html' = '/terms-condition'
    'privacy-policy.html' = '/privacy-policy'
    'error-404.html' = '/error-404'
    'error-500.html' = '/error-500'
    'wishlist.html' = '/wishlist'
    'cart.html' = '/cart'
    'checkout.html' = '/checkout'
    'add-property-buy.html' = '/add-property-buy'
    'add-property-rent.html' = '/add-property-rent'
    'invoice-details.html' = '/invoice-details'
    'notifications.html' = '/notifications'
    'maintenance.html' = '/maintenance'
    'coming-soon.html' = '/coming-soon'
    'rental-booking.html' = '/rental-booking'
    'rental-order-confirmation.html' = '/rental-order-confirmation'
    'rental-order-details.html' = '/rental-order-details'
    'rental-payment.html' = '/rental-payment'
}

foreach ($file in $jsxFiles) {
    Write-Host "Processing: $($file.Name)"
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace each HTML link with React Router path
    foreach ($htmlFile in $routeMap.Keys) {
        $route = $routeMap[$htmlFile]
        # Replace href="filename.html" with to="route"
        $content = $content -replace "href=`"$htmlFile`"", "to=`"$route`""
        # Replace href="filename.html# with to="route"
        $content = $content -replace "href=`"$([regex]::Escape($htmlFile))#", "to=`"$route`""
    }
    
    # Replace <a with <Link for internal links (those with 'to=' attribute)
    # This regex finds <a tags that have 'to=' and replaces them with <Link
    $content = $content -replace '<a\s+([^>]*?)to=', '<Link $1to='
    
    # Replace closing </a> that come after Link tags
    # We need to be careful here - only replace </a> that correspond to <Link>
    # Simple approach: replace all standalone </a> with </Link> (since we converted <a to=... to <Link)
    # But keep <a href="#"> as is
    
    # Better approach: find patterns like <Link...>...</a> and replace </a> with </Link>
    $content = $content -replace '(<Link[^>]*>.*?)</a>', '$1</Link>'
    
    # Handle multiline Link tags
    $lines = $content -split "`r?`n"
    $inLinkTag = $false
    $newLines = @()
    
    foreach ($line in $lines) {
        if ($line -match '<Link\s') {
            $inLinkTag = $true
        }
        
        if ($inLinkTag -and $line -match '</a>') {
            $line = $line -replace '</a>', '</Link>'
            $inLinkTag = $false
        }
        
        $newLines += $line
    }
    
    $content = $newLines -join "`r`n"
    
    # Save the updated content
    [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
    
    Write-Host "Updated: $($file.Name)"
}

Write-Host "`nAll files updated with React Router links!"
