import '../core/app_role.dart';

class UserProfile {
  const UserProfile({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
  });

  final String id;
  final String email;
  final String fullName;
  final AppRole role;

  factory UserProfile.demo({required AppRole role}) {
    return UserProfile(
      id: 'demo-user-id',
      email: 'demo@wahen.app',
      fullName: 'WaHeN Demo User',
      role: role,
    );
  }
}
