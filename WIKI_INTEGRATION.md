# MediaWiki Integration Documentation

## Overview
This document describes the MediaWiki integration that automatically saves generated scenarios to a Wikipedia/MediaWiki instance.

## Features
- **Non-blocking**: Wiki saves happen asynchronously and don't interrupt scenario generation
- **Graceful degradation**: App works perfectly even if wiki is disabled or unavailable
- **Structured pages**: Scenarios are organized by region, time frame, and timestamp
- **Safe content**: All user input is sanitized to prevent wikitext injection

## Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Enable/disable wiki functionality
MEDIAWIKI_ENABLED=true

# MediaWiki API endpoint
MEDIAWIKI_API_URL=https://conceptia3-com.us.stackstaging.com/wiki141/api.php

# MediaWiki bot credentials
MEDIAWIKI_USERNAME=your_bot_username
MEDIAWIKI_PASSWORD=your_bot_password

# Optional: Client-side feature flag
REACT_APP_WIKI_ENABLED=true
```

### Setting Up MediaWiki Bot Account

1. **Create a bot account** on your MediaWiki instance
   - Go to Special:BotPasswords
   - Create a new bot password with appropriate permissions
   - Use the format: `username@botname:password`

2. **Or use regular account** (less secure, not recommended)
   - Use your regular username and password
   - Ensure the account has edit permissions

## Page Structure

Scenarios are saved with the following structure:

```
Scenario_World_Builder/
  └── [Region]/
      └── [TimeFrame]/
          └── Scenario_[Region]_[TimeFrame]_Age[Age]_[Timestamp]
```

Example:
```
Scenario_World_Builder/Algeria/2035/Scenario_Algeria_2035_Age14_2025-01-02T14-30-22
```

## Page Content Format

Each scenario page includes:
- **Header**: Region, time frame, learner age, approach
- **Scenario text**: The full generated scenario
- **Metadata**: Structured information for categorization
- **Categories**: Automatic categorization by region, time frame, and type

## How It Works

1. **User generates scenario** → Scenario is created as normal
2. **Background save** → After successful generation, scenario data is sent to server
3. **Server processing** → Server authenticates with MediaWiki and creates/updates page
4. **Non-blocking** → User experience is never interrupted, even if wiki save fails

## Error Handling

- **Wiki disabled**: Silently skipped, no errors shown
- **Authentication failure**: Logged to server console, user not affected
- **Network errors**: Logged but don't interrupt scenario generation
- **Invalid credentials**: Server logs error, app continues normally

## Testing

### Test with Wiki Disabled
1. Set `MEDIAWIKI_ENABLED=false` in `.env`
2. Generate a scenario
3. Verify scenario generates normally
4. Check server logs - should see "Wiki functionality disabled"

### Test with Wiki Enabled
1. Set `MEDIAWIKI_ENABLED=true` in `.env`
2. Add valid credentials
3. Generate a scenario
4. Check MediaWiki for new page
5. Verify page content is correct

### Test Error Handling
1. Use invalid credentials
2. Generate a scenario
3. Verify scenario still generates
4. Check server logs for error messages

## Files Modified/Created

### New Files
- `server/wikiService.js` - MediaWiki API integration
- `src/utils/wikiService.js` - Client-side wiki service

### Modified Files
- `server.js` - Added `/api/save-to-wiki` endpoint
- `src/components/ScenarioGenerator.jsx` - Integrated wiki save calls
- `.env` - Added MediaWiki configuration

## Security Considerations

1. **Credentials**: Never commit `.env` file with real credentials
2. **Bot account**: Use dedicated bot account, not personal account
3. **Permissions**: Limit bot permissions to necessary pages only
4. **Input sanitization**: All user input is escaped to prevent wikitext injection
5. **HTTPS**: Ensure MediaWiki API URL uses HTTPS in production

## Troubleshooting

### "Wiki functionality disabled or not configured"
- Check `MEDIAWIKI_ENABLED` is set to `true`
- Verify all required environment variables are set

### "Login failed" or authentication errors
- Verify username and password are correct
- Check if bot password format is correct (username@botname:password)
- Ensure account has edit permissions

### "Failed to get CSRF token"
- Check MediaWiki API URL is correct
- Verify network connectivity to MediaWiki server
- Check MediaWiki server logs for errors

### Pages not appearing in wiki
- Check server console logs for errors
- Verify page title doesn't exceed MediaWiki limits (255 bytes)
- Check MediaWiki permissions for bot account

## Future Enhancements

Potential improvements:
- Index page maintenance (automatically update list of scenarios)
- Batch updates for multiple scenarios
- Wiki sync status indicator in UI
- Retry mechanism for failed saves
- Page update vs. create logic (update existing pages)

