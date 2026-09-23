enum AppRole {
  customer,
  seller,
  admin,
}

extension AppRoleExtension on AppRole {
  String get value => switch (this) {
        AppRole.customer => 'customer',
        AppRole.seller => 'seller',
        AppRole.admin => 'admin',
      };

  String get label => switch (this) {
        AppRole.customer => 'Customer',
        AppRole.seller => 'Seller',
        AppRole.admin => 'Admin',
      };

  static AppRole fromValue(String? value) {
    switch (value) {
      case 'seller':
        return AppRole.seller;
      case 'admin':
        return AppRole.admin;
      case 'customer':
      default:
        return AppRole.customer;
    }
  }
}
