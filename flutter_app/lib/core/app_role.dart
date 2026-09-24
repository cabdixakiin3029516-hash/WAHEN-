enum AppRole { buyer, seller, admin }

extension AppRoleExtension on AppRole {
  String get name {
    switch (this) {
      case AppRole.admin:
        return 'Admin';
      case AppRole.seller:
        return 'Seller';
      case AppRole.buyer:
      default:
        return 'Buyer';
    }
  }
}
