# RrWeb Integration Documentation Index

Complete documentation for the RrWeb integration with the Omni Analytics SDK.

---

## 📖 Main Guides

### 1. **[RrWeb Setup Guide](./RRWEB_SETUP.md)** ⭐ START HERE

- **Purpose:** Complete setup and configuration guide
- **Who should read:** Anyone implementing session replay
- **Contains:**
  - 3 installation methods (NPM, CDN, Hybrid)
  - Configuration options for all components
  - Advanced configuration examples
  - Handling missing rrweb gracefully
  - Performance optimization tips
  - Backend integration requirements

### 2. **[Quick Start RrWeb](./QUICK_START_RRWEB.md)** ⚡ QUICK REFERENCE

- **Purpose:** Quick reference and code snippets
- **Who should read:** Developers wanting copy-paste examples
- **Contains:**
  - Installation one-liners
  - Basic setup (React app example)
  - Complete Tracker API reference
  - Configuration examples
  - Common patterns
  - Debugging techniques
  - Troubleshooting table

### 3. **[RrWeb Dependency Guide](./RRWEB_DEPENDENCY_GUIDE.md)** 📚 DEEP DIVE

- **Purpose:** Explain the dependency model
- **Who should read:** Architects, understanding design decisions
- **Contains:**
  - Detailed explanation of changes
  - Backward compatibility analysis
  - Feature comparison matrix
  - Migration guide from global rrweb
  - Performance implications
  - Error handling scenarios

### 4. **[RrWeb Architecture](./RRWEB_ARCHITECTURE.md)** 🏗️ INTERNALS

- **Purpose:** Understand the system design
- **Who should read:** Developers extending the SDK
- **Contains:**
  - Component diagrams
  - Data flow diagrams
  - Class hierarchies
  - State management
  - Event type relationships
  - Dependency injection patterns
  - Error handling hierarchy
  - Testing strategy

### 5. **[RrWeb Changes Summary](./RRWEB_CHANGES_SUMMARY.md)** 📋 OVERVIEW

- **Purpose:** High-level summary of what changed
- **Who should read:** Team leads, reviewers
- **Contains:**
  - List of modified files
  - Before/after comparisons
  - Key design decisions
  - Breaking changes (none!)
  - Testing checklist
  - Migration path

---

## 📺 Feature Guides

### Session Snapshots & Heatmaps

- **[Session Snapshots](./SESSION_SNAPSHOTS.md)** - DOM capture for replay and heatmaps
- **[Snapshots Examples](./SNAPSHOTS_EXAMPLES.md)** - Code examples for snapshot features
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Complete feature overview

---

## 🎯 Use Cases

### Session Replay

1. Read: [RrWeb Setup](./RRWEB_SETUP.md) (Installation & Configuration sections)
2. Implement: [Quick Start](./QUICK_START_RRWEB.md) (Basic Setup section)
3. Debug: Check [Troubleshooting](./RRWEB_SETUP.md#troubleshooting)

### Heatmap Generation

1. Read: [Session Snapshots](./SESSION_SNAPSHOTS.md) (Heatmaps section)
2. Example: [Snapshots Examples](./SNAPSHOTS_EXAMPLES.md) (Heatmap examples)
3. Config: [RrWeb Setup](./RRWEB_SETUP.md) (Privacy Configuration)

### Retention Metrics

1. Read: [Session Snapshots](./SESSION_SNAPSHOTS.md) (Retention Metrics section)
2. Understand: [Architecture](./RRWEB_ARCHITECTURE.md) (Data Flow)
3. Implement: [Examples](./SNAPSHOTS_EXAMPLES.md) (Custom tracking)

### Performance Optimization

1. Review: [RrWeb Setup](./RRWEB_SETUP.md) (Performance Considerations)
2. Understand: [Architecture](./RRWEB_ARCHITECTURE.md) (Performance Characteristics)
3. Apply: [Quick Start](./QUICK_START_RRWEB.md) (Configuration)

---

## 🔍 Topic Index

### Installation & Setup

- [RrWeb Setup Guide](./RRWEB_SETUP.md#installation) - Installation methods
- [Quick Start](./QUICK_START_RRWEB.md#installation) - Quick commands
- [RrWeb Dependency Guide](./RRWEB_DEPENDENCY_GUIDE.md#installation-methods-supported) - Feature matrix

### Configuration

- [RrWeb Setup Guide](./RRWEB_SETUP.md#configuration) - All config options
- [Quick Start](./QUICK_START_RRWEB.md#sdk-configuration) - SDK config example
- [Architecture](./RRWEB_ARCHITECTURE.md#state-management) - State structures

### Usage Patterns

- [RrWeb Setup Guide](./RRWEB_SETUP.md#basic-usage) - 3 usage methods
- [Quick Start](./QUICK_START_RRWEB.md#basic-setup-react-app) - React example
- [Examples](./SNAPSHOTS_EXAMPLES.md) - Comprehensive examples

### API Reference

- [Quick Start](./QUICK_START_RRWEB.md#tracker-api) - Tracker methods
- [API Reference](./API_REFERENCE.md) - Complete API
- [Architecture](./RRWEB_ARCHITECTURE.md#class-hierarchy) - Class structures

### Troubleshooting

- [RrWeb Setup Guide](./RRWEB_SETUP.md#troubleshooting) - Common issues
- [Quick Start](./QUICK_START_RRWEB.md#troubleshooting) - Troubleshooting table
- [Examples](./SNAPSHOTS_EXAMPLES.md#error-handling) - Error handling examples

### Performance & Optimization

- [RrWeb Setup Guide](./RRWEB_SETUP.md#performance-considerations) - Performance tips
- [Architecture](./RRWEB_ARCHITECTURE.md#performance-characteristics) - Performance metrics
- [Dependency Guide](./RRWEB_DEPENDENCY_GUIDE.md#performance-implications) - Bundle size impact

### Privacy & Security

- [RrWeb Setup Guide](./RRWEB_SETUP.md#privacy-configuration) - Privacy config
- [Session Snapshots](./SESSION_SNAPSHOTS.md#privacy-first-design) - Privacy features
- [Architecture](./RRWEB_ARCHITECTURE.md#privacy--security-layer) - Privacy architecture

---

## 📊 Documentation Structure

```
docs/
├── README.md                           ← Main docs home (updated with links)
├── GETTING_STARTED.md                  ← SDK getting started
├── API_REFERENCE.md                    ← Complete API docs
├── ARCHITECTURE.md                     ← SDK architecture
├── PLUGIN_DEVELOPMENT.md               ← Custom plugin guide
│
├── SESSION_SNAPSHOTS.md                ← Session snapshots guide
├── SNAPSHOTS_EXAMPLES.md               ← Code examples
├── IMPLEMENTATION_SUMMARY.md           ← Feature overview
│
├── RRWEB_SETUP.md                      ← ⭐ START HERE (setup guide)
├── QUICK_START_RRWEB.md                ← ⚡ Quick reference
├── RRWEB_SETUP.md                      ← 📚 Deep dive
├── RRWEB_ARCHITECTURE.md               ← 🏗️ System design
├── RRWEB_CHANGES_SUMMARY.md            ← 📋 Summary of changes
└── RRWEB_DOCUMENTATION_INDEX.md        ← 📖 This file
```

---

## 🚀 Getting Started Paths

### Path 1: "I want to use rrweb with the SDK" (Most people)

1. Install: `npm install @omni-analytics/sdk rrweb`
2. Read: [RrWeb Setup - Basic Usage](./RRWEB_SETUP.md#basic-usage)
3. Copy: [Quick Start](./QUICK_START_RRWEB.md) example
4. Configure: [RrWeb Setup - Configuration](./RRWEB_SETUP.md#configuration)
5. Done! 🎉

### Path 2: "I need to understand the design" (Architects)

1. Overview: [RrWeb Changes Summary](./RRWEB_CHANGES_SUMMARY.md)
2. Design: [RrWeb Architecture](./RRWEB_ARCHITECTURE.md)
3. Details: [RrWeb Dependency Guide](./RRWEB_DEPENDENCY_GUIDE.md)
4. Review: Related code in `packages/sdk/src/`

### Path 3: "I'm troubleshooting an issue" (Debugging)

1. Check: [Quick Start - Troubleshooting](./QUICK_START_RRWEB.md#troubleshooting)
2. Learn: [RrWeb Setup - Troubleshooting](./RRWEB_SETUP.md#troubleshooting)
3. Debug: [Quick Start - Debugging](./QUICK_START_RRWEB.md#debugging)
4. Ask: Check GitHub issues

### Path 4: "I want to extend the SDK" (Developers)

1. Design: [RrWeb Architecture](./RRWEB_ARCHITECTURE.md)
2. Code: Review `packages/sdk/src/utils/rrwebIntegration.ts`
3. Extend: [Plugin Development](./PLUGIN_DEVELOPMENT.md)
4. Test: See [Architecture - Testing Strategy](./RRWEB_ARCHITECTURE.md#testing-strategy)

---

## 📚 Related Documentation

### Core SDK

- [Getting Started](./GETTING_STARTED.md) - SDK basics
- [API Reference](./API_REFERENCE.md) - Complete API
- [Architecture](./ARCHITECTURE.md) - SDK internals
- [Plugin Development](./PLUGIN_DEVELOPMENT.md) - Custom plugins

### Analytics Features

- [Session Snapshots](./SESSION_SNAPSHOTS.md) - DOM capture guide
- [Snapshots Examples](./SNAPSHOTS_EXAMPLES.md) - Code examples
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Feature overview

---

## 🎓 Learning Resources

### For Beginners

1. Start with: [Quick Start RrWeb](./QUICK_START_RRWEB.md)
2. Try: Copy-paste examples
3. Configure: Follow setup steps
4. Debug: Use troubleshooting table

### For Intermediate Users

1. Read: [RrWeb Setup Guide](./RRWEB_SETUP.md)
2. Understand: [Session Snapshots](./SESSION_SNAPSHOTS.md)
3. Review: [Examples](./SNAPSHOTS_EXAMPLES.md)
4. Optimize: Performance tips section

### For Advanced Users

1. Study: [RrWeb Architecture](./RRWEB_ARCHITECTURE.md)
2. Review: [Dependency Guide](./RRWEB_DEPENDENCY_GUIDE.md)
3. Explore: Source code
4. Extend: [Plugin Development](./PLUGIN_DEVELOPMENT.md)

---

## ✅ Documentation Checklist

- ✅ Setup guide with 3 installation methods
- ✅ Quick reference with copy-paste examples
- ✅ Deep dive on dependency model
- ✅ Architecture documentation
- ✅ Changes summary and checklist
- ✅ Troubleshooting guide
- ✅ Performance optimization tips
- ✅ Privacy and security documentation
- ✅ Error handling scenarios
- ✅ This index file

---

## 🔗 Quick Links

| Document                                        | Purpose                      | Audience   |
| ----------------------------------------------- | ---------------------------- | ---------- |
| [RrWeb Setup](./RRWEB_SETUP.md)                 | Installation & configuration | Everyone   |
| [Quick Start](./QUICK_START_RRWEB.md)           | Code examples & reference    | Developers |
| [Dependency Guide](./RRWEB_DEPENDENCY_GUIDE.md) | Design & decisions           | Architects |
| [Architecture](./RRWEB_ARCHITECTURE.md)         | System internals             | Developers |
| [Changes Summary](./RRWEB_CHANGES_SUMMARY.md)   | What changed                 | Reviewers  |
| [Session Snapshots](./SESSION_SNAPSHOTS.md)     | Feature guide                | Everyone   |
| [Examples](./SNAPSHOTS_EXAMPLES.md)             | Code examples                | Developers |

---

## 📞 Support

- 📖 Check relevant documentation above
- 🔍 Search troubleshooting section
- 🐛 File GitHub issue with:
  - Exact error message
  - Steps to reproduce
  - Your installation method
  - Node/npm versions

---

**Last Updated:** December 12, 2025  
**SDK Version:** 0.1.0  
**RrWeb Version:** ^2.0.0
