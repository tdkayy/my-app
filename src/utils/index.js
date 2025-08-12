export function createPageUrl(page) {
    switch (page) {
      case "Dashboard":
        return "/dashboard";
      case "Documentation":
        return "/documentation";
      default:
        return "/";
    }
  }
  