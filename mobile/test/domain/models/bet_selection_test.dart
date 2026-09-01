import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/domain/models/bet_selection.dart';

void main() {
  group('BetSelection', () {
    const sampleSelection = BetSelection(
      eventId: '72221212',
      eventName: 'Aston Villa vs. Arsenal FC',
      marketId: '72221212546',
      marketName: 'Double Chance & Both Teams To Score (GG/NG)',
      selectionId: '722212125461718',
      selectionName: 'Aston Villa/Draw & Yes',
      odds: 3.35,
      sportId: 'soccer',
      league: 'Premier League',
      region: 'England',
      eventStartTime: 1725114600,
      isMarketActive: true,
    );

    final sampleJson = <String, dynamic>{
      'eventId': '72221212',
      'eventName': 'Aston Villa vs. Arsenal FC',
      'marketId': '72221212546',
      'marketName': 'Double Chance & Both Teams To Score (GG/NG)',
      'selectionId': '722212125461718',
      'selectionName': 'Aston Villa/Draw & Yes',
      'odds': 3.35,
      'sportId': 'soccer',
      'league': 'Premier League',
      'region': 'England',
      'eventStartTime': 1725114600,
      'isMarketActive': true,
    };

    test('deserializes from JSON map correctly', () {
      final selection = BetSelection.fromJson(sampleJson);

      expect(selection.eventId, '72221212');
      expect(selection.eventName, 'Aston Villa vs. Arsenal FC');
      expect(selection.marketId, '72221212546');
      expect(
        selection.marketName,
        'Double Chance & Both Teams To Score (GG/NG)',
      );
      expect(selection.selectionId, '722212125461718');
      expect(selection.selectionName, 'Aston Villa/Draw & Yes');
      expect(selection.odds, 3.35);
      expect(selection.sportId, 'soccer');
      expect(selection.league, 'Premier League');
      expect(selection.region, 'England');
      expect(selection.eventStartTime, 1725114600);
      expect(selection.isMarketActive, true);
    });

    test('serializes to JSON map correctly', () {
      final json = sampleSelection.toJson();

      expect(json['eventId'], '72221212');
      expect(json['eventName'], 'Aston Villa vs. Arsenal FC');
      expect(json['marketId'], '72221212546');
      expect(json['marketName'], 'Double Chance & Both Teams To Score (GG/NG)');
      expect(json['selectionId'], '722212125461718');
      expect(json['selectionName'], 'Aston Villa/Draw & Yes');
      expect(json['odds'], 3.35);
      expect(json['sportId'], 'soccer');
      expect(json['league'], 'Premier League');
      expect(json['region'], 'England');
      expect(json['eventStartTime'], 1725114600);
      expect(json['isMarketActive'], true);
    });

    test('supports value equality via Equatable', () {
      const copy = BetSelection(
        eventId: '72221212',
        eventName: 'Aston Villa vs. Arsenal FC',
        marketId: '72221212546',
        marketName: 'Double Chance & Both Teams To Score (GG/NG)',
        selectionId: '722212125461718',
        selectionName: 'Aston Villa/Draw & Yes',
        odds: 3.35,
        sportId: 'soccer',
        league: 'Premier League',
        region: 'England',
        eventStartTime: 1725114600,
        isMarketActive: true,
      );

      const different = BetSelection(
        eventId: '99999999',
        eventName: 'Chelsea vs. Liverpool',
        marketId: '99999999123',
        marketName: 'Match Winner',
        selectionId: '99999999123456',
        selectionName: 'Chelsea',
        odds: 2.10,
      );

      expect(sampleSelection, equals(copy));
      expect(sampleSelection.hashCode, equals(copy.hashCode));
      expect(sampleSelection, isNot(equals(different)));
    });
  });
}
