/\*\*

- Quick notes for refactoring cards to use centralized data
-
- Pattern:
- 1.  Remove the main useEffect that fetches on refetchTrigger
- 2.  Add data to props and initialize state from props
- 3.  Keep the handlers for add/edit/delete that call triggerRefetch()
- 4.  Use props whenever data comes from parent, local state only for UI state
      \*/

// Example implementation pattern:
// export function SomeCard({ data = [] }: {data: any[]}) {
// const [localData, setLocalData] = useState(data);
// const { triggerRefetch } = useTransactionStore();
//
// // NO useEffect on refetchTrigger - data comes from props!
//
// // Only keep handlers for mutations:
// const handleAdd = async (item: any) => {
// try {
// // ... save to DB
// triggerRefetch(); // Central refetch
// } catch (err) { ... }
// };
// }
