namespace AlphaTab.Audio.Synth.Ds
{
    class LinkedList<T> where T : class
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
            if (First == null) return null;
            var v = First.Value;
            Remove(First);
            return v;
        }

        public T RemoveLast()
        {
            if (First == null) return null;
            var v = First._prev != null ? First._prev.Value : null;
            Remove(First._prev);
            return v;
        }

        public void Remove(LinkedListNode<T> n)
        {
            if (n._next == n)
            {
                First = null;
            }
            else
            {
                n._next._prev = n._prev;
                n._prev._next = n._next;
                if (First == n)
                {
                    First = n._next;
                }
            }
            n.Invalidate();
            Length--;
        }

        private void InsertNodeBefore(LinkedListNode<T> node, LinkedListNode<T> newNode)
        {
            newNode._next = node;
            newNode._prev = node._prev;
            node._prev._next = newNode;
            node._prev = newNode;
            newNode._list = this;
            Length++;
        }

        private void InsertNodeToEmptyList(LinkedListNode<T> node)
        {
            node._next = node;
            node._prev = node;
            node._list = this;
            First = node;
            Length++;
        }
    }

    class LinkedListNode<T> where T : class
    {
        internal LinkedList<T> _list;
        internal LinkedListNode<T> _next;
        internal LinkedListNode<T> _prev;

        public T Value { get; set; }

        public LinkedListNode<T> Next
        {
            get
            {
                return _next == null || _list.First == _next ? null : _next;
            }
        }

        public LinkedListNode<T> Prev
        {
            get
            {
                return _prev == null || this == _list.First ? null : _prev;
            }
        }

        public void Invalidate()
        {
            _list = null;
            _next = null;
            _prev = null;
        }
    }

}
