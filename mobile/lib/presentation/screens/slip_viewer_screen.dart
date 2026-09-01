import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/slip_cubit.dart';
import '../cubit/slip_state.dart';
import '../widgets/booking_code_input.dart';
import '../widgets/odds_summary_card.dart';
import '../widgets/selection_card.dart';
import '../widgets/state_feedback_view.dart';

/// Primary screen for the Betway Nigeria Booking Code viewer.
///
/// Coordinates the [BookingCodeInput] form and displays the resolved [BetSlip]
/// details or status feedback depending on the current [SlipState].
class SlipViewerScreen extends StatefulWidget {
  const SlipViewerScreen({super.key});

  @override
  State<SlipViewerScreen> createState() => _SlipViewerScreenState();
}

class _SlipViewerScreenState extends State<SlipViewerScreen> {
  final TextEditingController _codeController = TextEditingController();
  String _lastAttemptedCode = '';

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  void _handleDecode(String code) {
    _lastAttemptedCode = code;
    context.read<SlipCubit>().resolve(code);
  }

  void _handleRetry() {
    final codeToRetry = _lastAttemptedCode.isNotEmpty
        ? _lastAttemptedCode
        : _codeController.text.trim();
    if (codeToRetry.isNotEmpty) {
      context.read<SlipCubit>().resolve(codeToRetry);
    }
  }

  void _handleReset() {
    _codeController.clear();
    _lastAttemptedCode = '';
    context.read<SlipCubit>().reset();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Betway Nigeria Slip Viewer',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        centerTitle: false,
        actions: [
          BlocBuilder<SlipCubit, SlipState>(
            builder: (context, state) {
              if (state is SlipSuccess || state is SlipError) {
                return IconButton(
                  key: const Key('reset_app_bar_button'),
                  icon: const Icon(Icons.refresh),
                  tooltip: 'Reset to initial state',
                  onPressed: _handleReset,
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: BlocConsumer<SlipCubit, SlipState>(
          listener: (context, state) {
            if (state is SlipSuccess && state.slip.bookingCode != null) {
              if (_codeController.text != state.slip.bookingCode) {
                _codeController.text = state.slip.bookingCode!;
              }
            }
          },
          builder: (context, state) {
            final isLoading = state is SlipLoading;

            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 12.0,
              ),
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Booking code input section
                  BookingCodeInput(
                    controller: _codeController,
                    isLoading: isLoading,
                    onDecode: _handleDecode,
                  ),
                  const SizedBox(height: 16),

                  // State-dependent content section
                  if (state is SlipInitial) ...[
                    const SlipInitialView(),
                  ] else if (state is SlipLoading) ...[
                    const SlipLoadingView(),
                  ] else if (state is SlipError) ...[
                    SlipErrorView(
                      message: state.message,
                      code: state.code,
                      onRetry: _handleRetry,
                    ),
                  ] else if (state is SlipSuccess) ...[
                    OddsSummaryCard(slip: state.slip),
                    const SizedBox(height: 16),
                    Wrap(
                      alignment: WrapAlignment.spaceBetween,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 8,
                      runSpacing: 4,
                      children: [
                        Text(
                          'Selections (${state.slip.selections.length})',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          'Canonical Domain View',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: state.slip.selections.length,
                      itemBuilder: (context, index) {
                        final selection = state.slip.selections[index];
                        return SelectionCard(
                          selection: selection,
                          index: index + 1,
                        );
                      },
                    ),
                  ],
                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
