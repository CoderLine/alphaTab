namespace AlphaTab.Audio.Synth.Ds
{
    internal class LinkedList<T> where T : class
    {
        public LinkedListNode<T> First { get; set; }

        public int Length { get; private set; }

        public LinkedList()
        {
            Length = 0;
        }

        public void AddFirst(T value)
        {
            var node = new LinkedListNode<T>();
            node.Value = value;
            if (First == null)
            {
                InsertNodeToEmptyList(node);
            }
            else
            {
                InsertNodeBefore(First, node);
                First = node;
            }
        }

        public void AddLast(T value)
        {
            var node = new LinkedListNode<T>();
            node.Value = value;
            if (First == null)
            {
                InsertNodeToEmptyList(node);
            }
            else
            {
                InsertNodeBefore(First, node);
            }
        }

        public T RemoveFirst()
        {
            if (First == null)
            {
                return null;
            }

            var v = First.Value;
            Remove(First);
            return v;
        }

        public T RemoveLast()
        {
            if (First == null)
            {
                return null;
            }

            var v = First.PrevInternal != null ? First.PrevInternal.Value : null;
            Remove(First.PrevInternal);
            return v;
        }

        public void Remove(LinkedListNode<T> n)
        {
            if (n.NextInternal == n)
            {
                First = null;
            }
            else
            {
                n.NextInternal.PrevInternal = n.PrevInternal;
                n.PrevInternal.NextInternal = n.NextInternal;
                if (First == n)
                {
                    First = n.NextInternal;
                }
            }

            n.Invalidate();
            Length--;
        }

        private void InsertNodeBefore(LinkedListNode<T> node, LinkedListNode<T> newNode)
        {
            newNode.NextInternal = node;
            newNode.PrevInternal = node.PrevInternal;
            node.PrevInternal.NextInternal = newNode;
            node.PrevInternal = newNode;
            newNode.List = this;
            Length++;
        }

        private void InsertNodeToEmptyList(LinkedListNode<T> node)
        {
            node.NextInternal = node;
            node.PrevInternal = node;
            node.List = this;
            First = node;
            Length++;
        }
    }

    internal class LinkedListNode<T> where T : class
    {
        internal LinkedList<T> List;
        internal LinkedListNode<T> NextInternal;
        internal LinkedListNode<T> PrevInternal;

        public T Value { get; set; }

        public LinkedListNode<T> Next => NextInternal == null || List.First == NextInternal ? null : NextInternal;

        public LinkedListNode<T> Prev => PrevInternal == null || this == List.First ? null : PrevInternal;

        public void Invalidate()
        {
            List = null;
            NextInternal = null;
            PrevInternal = null;
        }
    }
}
