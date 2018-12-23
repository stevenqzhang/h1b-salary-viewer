# Manual testing steps

## test url params and deep linking works

### from url into rendering

1. Go to: `http://localhost:5000/?junkparam1=foo&em=tableau&job_title=soft&city=s&year=&junkurlparam2=1`

2. Search fields should be populated, junkurlparam1/2 should be ignored
3. Table should be shown

### from rendered into URL

4. now type another query into some searchboxes

5. URL should update, and junk urlparams should disappear

### Menu navigation basic

1. click through some menu items

2. Deep links should match above

### Menu navigation iteration
1. click menu items

2. Click search again

## Testing responsive table

1. Go to `http://localhost:5000/?em=tab&job_title=&city=pal&year=` and test on ipad device shape in dev tools

2. same but iPhone too
