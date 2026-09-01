import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:mobile/di/injection.dart';
import 'package:mobile/domain/gateways/slip_gateway.dart';
import 'package:mobile/main.dart';

class MockSlipGateway extends Mock implements SlipGateway {}

void main() {
  late MockSlipGateway mockGateway;

  setUp(() async {
    await resetDependencies();
    mockGateway = MockSlipGateway();
    await configureDependencies(gateway: mockGateway);
  });

  tearDown(() async {
    await resetDependencies();
  });

  testWidgets(
    'BetwayMobileApp builds MaterialApp and initial SlipViewerScreen',
    (tester) async {
      await tester.pumpWidget(const BetwayMobileApp());

      expect(find.byType(MaterialApp), findsOneWidget);
      expect(find.text('Betway Nigeria Slip Viewer'), findsOneWidget);
      expect(find.text('No Bet Slip Loaded'), findsOneWidget);
    },
  );
}
