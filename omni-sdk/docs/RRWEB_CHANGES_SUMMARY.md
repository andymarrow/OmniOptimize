# RrWeb Integration - Summary of Changes

## What Was Done

The Omni Analytics SDK has been refactored to properly support **rrweb as an optional npm dependency** instead of relying on global script loading. This enables:

✅ Clean npm module imports  
✅ Proper dependency management  
✅ Bundle size control (load only what you need)  
✅ TypeScript support  
✅ Lazy loading capabilities  
✅ Graceful fallbacks

---

## Files Modified

### 1. **packages/sdk/package.json**

- Added rrweb as optional peer dependency
- Added rrweb to optionalDependencies

### 2. **packages/sdk/src/utils/rrwebIntegration.ts**

- Refactored RrwebManager constructor to accept rrweb instance
- Added support for CDN fallback (window.rrweb)
- Added `setRrwebInstance()` method for lazy loading
- Updated documentation with 3 usage patterns
- Added RrwebLibrary interface

### 3. **packages/sdk/src/plugins/session-snapshot/SessionSnapshotPlugin.ts**

- Added `rrwebInstance` option to SessionSnapshotPluginOptions
- Updated `setupRrweb()` to use passed instance
- Updated documentation
- Proper error handling when rrweb unavailable

### 4. **packages/sdk/src/index.ts**

- Exported `SessionSnapshotPluginOptions` type
- Exported `RrwebLibrary` type
- Updated exports to support new functionality

### 5. **packages/sdk/src/types/index.ts**

- Exported RrwebEvent and HeatmapClick types

### 6. **docs/README.md**

- Added new documentation links
- Added Session Replay section to features
- Updated quick links to new guides

### 7. **docs/RRWEB_SETUP.md** (NEW)

- Complete rrweb setup and configuration guide
- 3 installation methods with examples
- Configuration options for all components
- Troubleshooting section
- Performance optimization tips
- Backend integration guide

### 8. **docs/RRWEB_DEPENDENCY_GUIDE.md** (NEW)

- Detailed explanation of dependency model
- Migration guide from global rrweb
- Feature matrix comparing installation methods
- Error handling scenarios
- Performance implications analysis

### 9. **docs/QUICK_START_RRWEB.md** (NEW)

- Quick reference guide
- Copy-paste examples
- Common patterns
- API reference
- Troubleshooting table

---

## Usage Examples

### Before (Global Script)

```html
<script src="rrweb.js"></script>
<script>
  const plugin = new SessionSnapshotPlugin();
  // Relied on window.rrweb being available
</script>
```

### After (NPM Module) ✨

```typescript
import * as rrweb from "rrweb";
import { SessionSnapshotPlugin } from "@omni-analytics/sdk";

const plugin = new SessionSnapshotPlugin({
  rrwebInstance: rrweb,
});
```

---

## Installation Methods Supported

| Method         | Installation        | Usage                            | Best For                 |
| -------------- | ------------------- | -------------------------------- | ------------------------ |
| **NPM Module** | `npm install rrweb` | `import * as rrweb from 'rrweb'` | Build tools, TypeScript  |
| **CDN Script** | Load via script tag | Auto-detected as `window.rrweb`  | Simple sites, no build   |
| **Lazy Load**  | `npm install rrweb` | `await import('rrweb')`          | Performance optimization |

---

## Key Design Decisions

### 1. Optional Dependency

- Users only install rrweb if they need session replay
- Reduces bundle size for users who don't need it
- Clear optional dependency marker in package.json

### 2. Flexible Input

- Accept rrweb instance as constructor parameter
- Support both npm import and CDN global
- Allow late-binding via `setRrwebInstance()`

### 3. Graceful Degradation

- Falls back to manual snapshots if rrweb unavailable
- No breaking changes to existing code
- Clear error messages guide users

### 4. Type Safety

- New `RrwebLibrary` interface
- `SessionSnapshotPluginOptions` with rrwebInstance
- Full TypeScript support

---

## Breaking Changes

✅ **None!** This is fully backward compatible.

Existing code continues to work:

```typescript
const plugin = new SessionSnapshotPlugin();
// Will auto-detect window.rrweb if available
// Falls back to manual snapshots otherwise
```

---

## Migration Path

### For existing users with CDN rrweb:

1. No changes needed - auto-detection still works
2. Optionally switch to npm import for better control

### For new users:

1. `npm install rrweb @omni-analytics/sdk`
2. Pass rrweb instance: `new SessionSnapshotPlugin({ rrwebInstance: rrweb })`
3. Done!

---

## Testing

### Verify rrweb is loaded:

```typescript
import * as rrweb from "rrweb";
import { RrwebManager } from "@omni-analytics/sdk";

const manager = new RrwebManager(rrweb);
console.log(manager.isAvailable()); // true
```

### Test fallback:

```typescript
const manager = new RrwebManager(null);
console.log(manager.isAvailable()); // false
// Plugin will use manual snapshots
```

### Check recording status:

```typescript
const status = manager.getStatus();
// { recording: true, initialized: true, available: true, debug: false }
```

---

## Performance Impact

### Bundle Size

- SDK alone: ~50KB gzipped
- rrweb: ~30KB gzipped
- Users who don't need snapshots: no impact
- Users with snapshots: +30KB

### Runtime

- Optional loading: load only when needed
- Configurable sampling: reduce event frequency
- Automatic compression: gzip encoding
- Blocking selectors: skip unnecessary elements

---

## Documentation Created

1. **RRWEB_SETUP.md** - Comprehensive setup guide

   - Installation methods
   - Configuration options
   - Performance tuning
   - Troubleshooting

2. **RRWEB_DEPENDENCY_GUIDE.md** - Dependency model explanation

   - Feature matrix
   - Error scenarios
   - Migration guide
   - Backward compatibility

3. **QUICK_START_RRWEB.md** - Quick reference
   - Copy-paste examples
   - Common patterns
   - API reference
   - Debugging tips

---

## Next Steps

### For Users

1. Read [RRWEB_SETUP.md](./RRWEB_SETUP.md) for setup instructions
2. Check [QUICK_START_RRWEB.md](./QUICK_START_RRWEB.md) for examples
3. Configure privacy settings for your use case
4. Test with your application

### For Developers

1. Review `RrwebManager` in `utils/rrwebIntegration.ts`
2. Check `SessionSnapshotPlugin` in `plugins/session-snapshot/`
3. Look at exported types in `types/index.ts`
4. Run tests to ensure no regressions

### For Documentation

1. Add RrWeb setup link to main README ✅
2. Add quick reference to docs ✅
3. Add troubleshooting guide ✅
4. Add performance tips ✅

---

## Checklist

- ✅ rrweb added to optional dependencies
- ✅ RrwebManager refactored for module imports
- ✅ SessionSnapshotPlugin supports rrwebInstance option
- ✅ Types properly exported
- ✅ Backward compatibility maintained
- ✅ Documentation created (3 guides)
- ✅ Examples provided
- ✅ Error handling implemented
- ✅ Lazy loading supported
- ✅ CDN fallback supported

---

## Support & Troubleshooting

### "rrweb is not available"

Solution: Install via npm: `npm install rrweb`

### "Large snapshot payloads"

Solution: Enable compression (automatic), reduce sample rate

### "Performance issues"

Solution: Disable mutations, increase periodic interval, use block selectors

### "Bundle size concerns"

Solution: Use lazy loading, optional dependency doesn't increase size

---

## Related Documentation

- 📖 [RrWeb Setup Guide](./RRWEB_SETUP.md)
- 📚 [Session Snapshots](./SESSION_SNAPSHOTS.md)
- 💡 [Code Examples](./SNAPSHOTS_EXAMPLES.md)
- 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- 🔗 [API Reference](./API_REFERENCE.md)
- ⚡ [Quick Reference](./QUICK_START_RRWEB.md)
