/**
 * Design Pattern: CHAIN OF RESPONSIBILITY
 * ------------------------------------------------------------------
 * Both "save a grade" and "publish an assessment" require several,
 * independent checks to all pass before the write is allowed:
 * authorization, referential integrity (does the student/assessment
 * really belong to this course?), and business rules (score range,
 * weight totals). Cramming all of that into one big `if` block in the
 * service method makes it hard to read, test in isolation, or reuse
 * pieces of the logic elsewhere.
 *
 * The Chain of Responsibility pattern lets each concern live in its own
 * small handler. Handlers are linked together; each one validates its
 * one responsibility and, if it passes, hands off to the next. The first
 * handler to fail throws immediately and short-circuits the rest of the
 * chain - the service method just calls `chain.handle(context)` and
 * either it resolves (all checks passed) or throws a `DomainError`
 * subtype with a specific, actionable Hebrew message.
 */

export abstract class ValidationHandler<TContext> {
  private nextHandler?: ValidationHandler<TContext>;

  /** Links `handler` as the next step in the chain and returns it, so calls can be chained: a.setNext(b).setNext(c) */
  setNext(handler: ValidationHandler<TContext>): ValidationHandler<TContext> {
    this.nextHandler = handler;
    return handler;
  }

  /** Runs this handler's check, then (if it passed) delegates to the next one in the chain. */
  async handle(context: TContext): Promise<void> {
    await this.validate(context);
    if (this.nextHandler) {
      await this.nextHandler.handle(context);
    }
  }

  /** Implemented by each concrete handler. Should throw a DomainError subtype on failure. */
  protected abstract validate(context: TContext): Promise<void>;
}
