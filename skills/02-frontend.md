# Skills — Domains 4–6: Compiler Frontend (146 skills)

---

## Domain 4 — Parsing (52)

131. Implement recursive-descent parsing over a token stream **[C] P2**
132. Implement a Pratt / precedence-climbing expression parser **[C] P2**
133. Register prefix parselets by token type **[C] P2**
134. Register infix parselets with binding powers **[C] P2**
135. Implement right-associative operators via binding-power adjustment **[C] P2**
136. Implement non-associative operators and reject chaining **[C] P2**
137. Implement postfix and call parselets **[C] P2**
138. Parse member access chains **[C] P2**
139. Parse indexing and slicing expressions **[I] P2**
140. Parse parenthesised grouping without a dedicated AST node **[C] P2**
141. Parse list, set, and record literals **[C] P2**
142. Parse quantifier expressions with a bound variable scope **[C] P2**
143. Parse temporal operator expressions **[C] P2**
144. Parse function-call arguments including named arguments **[C] P2**
145. Parse declaration headers and bodies uniformly **[C] P2**
146. Parse block-structured declarations with brace matching **[C] P2**
147. Parse a field list with typed annotations **[C] P2**
148. Parse enum declarations in both ordered and unordered forms **[C] P2**
149. Parse the three rule surface forms **[C] P2**
150. Desugar surface forms into the core rule form **[C] P2**
151. Parse the `test` construct including `given` and `expect` blocks **[C] P2**
152. Parse import declarations in all three forms **[C] P2**
153. Enforce declaration ordering constraints during parse **[C] P2**
154. Implement `expect(tokenType)` with a precise error on mismatch **[C] P2**
155. Implement `match`/`accept` optional-consumption helpers **[C] P2**
156. Implement lookahead without unbounded backtracking **[C] P2**
157. Guarantee the parser always consumes input or errors **[C] P2**
158. Guarantee the parser terminates on every input **[C] P2**
159. Enforce a maximum nesting depth to prevent stack exhaustion **[C] P2**
160. Implement panic-mode error recovery to synchronisation tokens **[C] P3**
161. Choose synchronisation token sets that maximise useful recovery **[C] P3**
162. Report multiple independent syntax errors in one pass **[C] P3**
163. Avoid cascading phantom errors after a recovery **[C] P3**
164. Insert error nodes into the AST to keep later phases running **[C] P3**
165. Distinguish a recoverable from a fatal parse error **[C] P3**
166. Preserve trivia (comments, whitespace) for the formatter **[I] P11**
167. Build a lossless concrete syntax tree when needed for tooling **[I] P11**
168. Build a lossy AST for the checker and IR **[C] P2**
169. Attach accurate spans to every AST node including synthesised ones **[C] P2**
170. Attach doc comments from trivia to their owning declaration **[C] P2**
171. Write a parser that is a mechanical mirror of the EBNF **[C] P2**
172. Prove parser/grammar correspondence by production coverage tests **[C] P2**
173. Write a pretty-printer that is the exact inverse of the parser **[C] P11**
174. Property-test parse-print-parse idempotence **[C] P2**
175. Fuzz the parser to zero panics **[C] P2**
176. Fuzz the parser for non-termination **[C] P2**
177. Benchmark parse throughput in MB/s **[I] P15**
178. Avoid allocation per token in the hot path **[I] P7**
179. Implement incremental reparsing for the LSP **[N] P11**
180. Reject pathological inputs (deep nesting, huge literals) with clear errors **[C] P2**
181. Explain why parser generators were rejected for this project **[C] P2**
182. Read and understand another language's hand-written parser **[I] P2**

---

## Domain 5 — Abstract Syntax and IR Design (38)

183. Design an AST as a closed tagged union **[C] P2**
184. Choose between a tree of pointers and an arena-with-indices layout **[I] P7**
185. Implement an arena-allocated AST with index handles **[I] P7**
186. Design AST nodes so that invalid states are unrepresentable **[C] P2**
187. Separate declaration nodes from expression nodes **[C] P2**
188. Implement an exhaustive visitor over the AST **[C] P2**
189. Implement a fold / reduce traversal over the AST **[I] P4**
190. Implement an AST rewriter for desugaring **[C] P2**
191. Keep desugaring total and span-preserving **[C] P2**
192. Design a typed AST distinct from the untyped AST **[C] P4**
193. Design an IR that is independent of surface syntax **[C] P6**
194. Design an IR that is canonical: one meaning, one encoding **[C] P6**
195. Prove canonicality by differential hashing of equivalent sources **[C] P6**
196. Normalise commutative operand order canonically **[C] P6**
197. Normalise set and record field order canonically **[C] P6**
198. Strip comments and whitespace from the IR while preserving doc text **[C] P6**
199. Design an IR that supports both codegen and report generation **[C] P6**
200. Serialise the IR in a stable binary format **[C] P6**
201. Version the IR format explicitly **[C] P6**
202. Reject IR with an unknown major version **[C] P6**
203. Compute a content digest of the IR **[C] P6**
204. Design the IR so digest equality implies semantic equality **[C] P6**
205. Explain why digest stability is the basis of policy identity **[C] P6**
206. Perform constant folding on the IR **[I] P7**
207. Perform dead-rule elimination on the IR **[I] P7**
208. Perform common-subexpression elimination on rule conditions **[N] P7**
209. Perform short-circuit reordering by cost estimate **[N] P7**
210. Guarantee optimisations preserve decision semantics exactly **[C] P7**
211. Write differential tests: optimised versus unoptimised IR **[C] P7**
212. Compute a static worst-case evaluation cost from the IR **[C] P7**
213. Emit the cost bound as compiler output **[C] P7**
214. Design IR debug dumps that a human can read **[I] P6**
215. Golden-test every IR dump **[C] P6**
216. Round-trip serialise and deserialise the IR losslessly **[C] P6**
217. Fuzz the IR deserialiser to zero panics **[C] P6**
218. Explain the difference between AST, IR, and bytecode **[C] P6**
219. Justify a three-stage lowering pipeline **[I] P6**
220. Map every IR node back to a source span for diagnostics **[C] P6**

---

## Domain 6 — Type Systems (56)

221. Define a type formally as a set of values plus operations **[C] P4**
222. Distinguish nominal from structural typing **[C] P4**
223. Implement nominal typing for declared entities **[C] P4**
224. Implement structural typing for records **[C] P4**
225. Implement a closed record type and reject unknown fields **[C] P4**
226. Implement parametric types (`Set[T]`, `List[T]`, `Optional[T]`) **[C] P4**
227. Implement type equality as a decidable relation **[C] P4**
228. Explain and implement subtyping where required (`Percent <: Decimal`) **[C] P4**
229. Justify the absence of general subtyping **[C] P4**
230. Implement bidirectional type checking **[C] P4**
231. Implement type synthesis (inference) for expressions **[C] P4**
232. Implement type checking against an expected type **[C] P4**
233. Explain why full Hindley–Milner inference is unnecessary here **[I] P4**
234. Implement a scoped, shadow-aware symbol table **[C] P4**
235. Implement binding for quantifier-bound variables **[C] P4**
236. Detect and reject shadowing where it harms readability **[C] P4**
237. Resolve qualified names across imported modules **[C] P4**
238. Resolve enum members with unambiguous inference **[C] P4**
239. Report enum member ambiguity rather than guessing **[C] P4**
240. Implement type checking for all binary operators **[C] P4**
241. Reject all implicit conversions **[C] P4**
242. Implement currency as part of the `Money` type **[C] P4**
243. Reject cross-currency arithmetic and comparison **[C] P4**
244. Implement dimensional analysis for `Duration` and `Timestamp` **[C] P4**
245. Reject `Timestamp + Timestamp` **[C] P4**
246. Implement `Optional[T]` without introducing null **[C] P4**
247. Enforce explicit discharge of every `Optional` **[C] P4**
248. Implement `??` coalescing with type preservation **[C] P4**
249. Implement flow-sensitive narrowing inside `if some x` **[I] P4**
250. Implement ordered-enum comparison type rules **[C] P4**
251. Reject ordered comparison on unordered types **[C] P4**
252. Implement set-membership type rules **[C] P4**
253. Implement collection element-type unification **[C] P4**
254. Reject heterogeneous collection literals **[C] P4**
255. Implement arbitrary-precision decimal type rules without float **[C] P4**
256. Reject literal division by zero at compile time **[C] P4**
257. Require a guard for possibly-zero division **[C] P4**
258. Type-check quantifier bodies in the extended scope **[C] P4**
259. Verify quantifier collections have a static cardinality bound **[C] P4**
260. Type-check temporal operator operands **[C] P4**
261. Type-check built-in function signatures **[C] P4**
262. Enforce that rule conditions are `Bool` **[C] P4**
263. Enforce that `applies_to` targets are `Bool` **[C] P4**
264. Validate attribute references against the declared schema **[C] P4**
265. Reject references to undeclared attributes **[C] P4**
266. Report type errors with both expected and actual types **[C] P4**
267. Report type errors at a minimal, precise source span **[C] P4**
268. Suggest a fix in every type error message **[I] P4**
269. Implement did-you-mean suggestions via edit distance **[I] P4**
270. Write a type-soundness proof sketch (progress and preservation) **[I] P13**
271. Explain what type soundness guarantees operationally **[C] P4**
272. Property-test that well-typed programs never yield type-error decisions **[C] P4**
273. Golden-test every type diagnostic **[C] P4**
274. Explain how the type system enforces the totality invariant **[C] P4**
275. Review a proposed type-system change against all eleven invariants **[C] P4**
276. Read and understand the Cedar or CEL type system specification **[I] P4**
