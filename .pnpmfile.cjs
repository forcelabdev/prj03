function readPackage(pkg, context) {
  // Approve builds for packages that require it
  if (pkg.name === 'puppeteer' || pkg.name === 'sharp') {
    pkg.pnpm = pkg.pnpm || {};
    pkg.pnpm.overrides = pkg.pnpm.overrides || {};
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
