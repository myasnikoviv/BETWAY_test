import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/domain/models/bet_selection.dart';
import 'package:mobile/presentation/widgets/selection_card.dart';

void main() {
  final testSelection = const BetSelection(
    eventId: '1001',
    eventName: 'Manchester City vs Liverpool FC',
    marketId: '2001',
    marketName: 'Match Result and Both Teams To Score',
    selectionId: '3001',
    selectionName: 'Home / Yes',
    odds: 3.40,
    league: 'Premier League',
    region: 'England',
    sportId: 'soccer',
  );

  Widget createSubject({required BetSelection selection, int? index}) {
    return MaterialApp(
      home: Scaffold(
        body: SelectionCard(selection: selection, index: index),
      ),
    );
  }

  group('SelectionCard Widget Tests', () {
    testWidgets('renders all selection information correctly', (tester) async {
      await tester.pumpWidget(
        createSubject(selection: testSelection, index: 1),
      );

      expect(find.text('1'), findsOneWidget);
      expect(find.text('Manchester City vs Liverpool FC'), findsOneWidget);
      expect(find.text('Premier League'), findsOneWidget);
      expect(find.text('(England)'), findsOneWidget);
      expect(find.text('Match Result and Both Teams To Score'), findsOneWidget);
      expect(find.text('Home / Yes'), findsOneWidget);
      expect(find.text('3.40'), findsOneWidget);
    });

    testWidgets('renders gracefully without index or league/region', (
      tester,
    ) async {
      final minimalSelection = const BetSelection(
        eventId: '1002',
        eventName: 'Team A vs Team B',
        marketId: '2002',
        marketName: '1X2',
        selectionId: '3002',
        selectionName: 'Draw',
        odds: 3.10,
      );

      await tester.pumpWidget(createSubject(selection: minimalSelection));

      expect(find.text('Team A vs Team B'), findsOneWidget);
      expect(find.text('1X2'), findsOneWidget);
      expect(find.text('Draw'), findsOneWidget);
      expect(find.text('3.10'), findsOneWidget);
    });
  });
}
