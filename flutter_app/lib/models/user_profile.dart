import '../core/app_role.dart';

class UserProfile {
  final String id;
  final String fullName;
  final String email;
  final AppRole role;

  UserProfile({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] ?? '',
      fullName: json['full_name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] == 'admin'
          ? AppRole.admin
          : json['role'] == 'seller'
              ? AppRole.seller
              : AppRole.buyer,
    );
  }
}
