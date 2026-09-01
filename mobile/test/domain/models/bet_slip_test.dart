import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/domain/models/bet_selection.dart';
import 'package:mobile/domain/models/bet_slip.dart';

void main() {
  group('BetSlip', () {
    const leg1 = BetSelection(
      eventId: '72221212',
      eventName: 'Aston Villa vs. Arsenal FC',
      marketId: '72221212546',
      marketName: 'Double Chance & Both Teams To Score',
      selectionId: '722212125461718',
      selectionName: 'Aston Villa/Draw & Yes',
      odds: 3.35,
    );

    const leg2 = BetSelection(
      eventId: '72221213',
      eventName: 'Brighton vs. Man Utd',
      marketId: '72221213111',
      marketName: 'Match Result',
      selectionId: '72221213111222',
      selectionName: 'Brighton',
      odds: 2.50,
    );

    test('calculates total odds correctly', () {
      final totalOdds = BetSlip.calculateTotalOdds([leg1, leg2]);
      expect(totalOdds, 8.38); // 3.35 * 2.50 = 8.375 -> 8.38
    });

    test('returns 0.0 total odds for empty selections', () {
      final totalOdds = BetSlip.calculateTotalOdds([]);
      expect(totalOdds, 0.0);
    });

    test(
      'BetSlip.create factory automatically computes totalOdds and isSingleBet',
      () {
        final multiSlip = BetSlip.create(
          bookingCode: 'BW12345',
          selections: [leg1, leg2],
        );

        expect(multiSlip.bookingCode, 'BW12345');
        expect(multiSlip.selections.length, 2);
        expect(multiSlip.totalOdds, 8.38);
        expect(multiSlip.isSingleBet, isFalse);
        expect(multiSlip.createdAt, isNotEmpty);

        final singleSlip = BetSlip.create(
          bookingCode: 'BW54321',
          selections: [leg1],
        );

        expect(singleSlip.selections.length, 1);
        expect(singleSlip.totalOdds, 3.35);
        expect(singleSlip.isSingleBet, isTrue);
      },
    );

    test('serializes and deserializes JSON roundtrip correctly', () {
      final slip = BetSlip.create(
        bookingCode: 'BW6D7ABCFB',
        selections: [leg1, leg2],
        createdAt: '2026-08-31T15:40:00.000Z',
      );

      final json = slip.toJson();
      expect(json['bookingCode'], 'BW6D7ABCFB');
      expect(json['totalOdds'], 8.38);
      expect(json['isSingleBet'], isFalse);
      expect(json['createdAt'], '2026-08-31T15:40:00.000Z');
      expect(json['selections'], isA<List>());

      final deserialized = BetSlip.fromJson(json);
      expect(deserialized, equals(slip));
      expect(deserialized.selections.length, 2);
      expect(
        deserialized.selections.first.selectionName,
        'Aston Villa/Draw & Yes',
      );
    });

    test('supports value equality via Equatable', () {
      final slip1 = BetSlip.create(
        bookingCode: 'BW11111',
        selections: [leg1],
        createdAt: '2026-09-01T12:00:00.000Z',
      );

      final slip2 = BetSlip.create(
        bookingCode: 'BW11111',
        selections: [leg1],
        createdAt: '2026-09-01T12:00:00.000Z',
      );

      expect(slip1, equals(slip2));
      expect(slip1.hashCode, equals(slip2.hashCode));
    });
  });
}
