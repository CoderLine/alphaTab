namespace AlphaTab.UI
{
    public interface IMouseEventArgs
    {
        bool IsLeftMouseButton { get; }

        float GetX(IContainer relativeTo);
        float GetY(IContainer relativeTo);

        void PreventDefault();
    }
}