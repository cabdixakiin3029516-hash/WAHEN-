import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;

/**
 * Desktop version of the WaHeN marketplace home screen.
 * Compile with: javac WahenAppUI.java
 * Run with:     java WahenAppUI
 */
public class WahenAppUI extends JFrame {
    private static final Color BRAND = new Color(67, 56, 202);
    private static final Color PAGE = new Color(246, 247, 252);

    private final JPanel content = new JPanel();
    private final JTextField searchField = new JTextField();

    public WahenAppUI() {
        setTitle("WaHeN Marketplace");
        setSize(430, 780);
        setMinimumSize(new Dimension(360, 620));
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);

        JPanel root = new JPanel(new BorderLayout());
        root.setBackground(PAGE);
        setContentPane(root);

        root.add(createHeader(), BorderLayout.NORTH);
        root.add(createMainContent(), BorderLayout.CENTER);
        root.add(createBottomNavigation(), BorderLayout.SOUTH);
    }

    private JPanel createHeader() {
        JPanel header = new JPanel();
        header.setLayout(new BoxLayout(header, BoxLayout.Y_AXIS));
        header.setBackground(Color.WHITE);
        header.setBorder(new EmptyBorder(14, 18, 14, 18));

        JPanel topRow = new JPanel(new BorderLayout());
        topRow.setOpaque(false);

        JButton menu = new JButton("☰");
        styleIconButton(menu);
        menu.addActionListener(e -> showMessage("Menu", "Account, Orders iyo Favorites"));

        JLabel brand = new JLabel("WaHeN", SwingConstants.CENTER);
        brand.setFont(new Font("SansSerif", Font.BOLD, 27));
        brand.setForeground(BRAND);

        JButton cart = new JButton("🛒");
        styleIconButton(cart);
        cart.addActionListener(e -> showMessage("Cart", "Gaadhigaagu hadda wuu madhan yahay."));

        topRow.add(menu, BorderLayout.WEST);
        topRow.add(brand, BorderLayout.CENTER);
        topRow.add(cart, BorderLayout.EAST);

        searchField.setText("");
        searchField.setToolTipText("Search products...");
        searchField.putClientProperty("JTextField.placeholderText", "🔍  Search products...");
        searchField.setMaximumSize(new Dimension(Integer.MAX_VALUE, 38));
        searchField.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(225, 226, 240)),
                new EmptyBorder(7, 10, 7, 10)));
        searchField.addActionListener(e -> showMessage("Search", "Waxaad raadisay: " + searchField.getText()));

        header.add(topRow);
        header.add(Box.createVerticalStrut(12));
        header.add(searchField);
        return header;
    }

    private JScrollPane createMainContent() {
        content.setLayout(new BoxLayout(content, BoxLayout.Y_AXIS));
        content.setBackground(PAGE);
        content.setBorder(new EmptyBorder(14, 16, 18, 16));

        content.add(createHero());
        content.add(Box.createVerticalStrut(16));
        content.add(sectionTitle("Categories"));
        content.add(Box.createVerticalStrut(9));
        content.add(createCategoryGrid());
        content.add(Box.createVerticalStrut(18));
        content.add(sectionTitle("Best Selling"));

        JScrollPane scroll = new JScrollPane(content);
        scroll.setBorder(null);
        scroll.getVerticalScrollBar().setUnitIncrement(16);
        return scroll;
    }

    private JPanel createHero() {
        JPanel hero = new JPanel(new BorderLayout(12, 0));
        hero.setBackground(new Color(255, 105, 55));
        hero.setBorder(new EmptyBorder(16, 16, 16, 16));
        hero.setMaximumSize(new Dimension(Integer.MAX_VALUE, 132));

        JPanel copy = new JPanel();
        copy.setOpaque(false);
        copy.setLayout(new BoxLayout(copy, BoxLayout.Y_AXIS));

        JLabel eyebrow = new JLabel("SUMMER SALE");
        eyebrow.setForeground(Color.WHITE);
        eyebrow.setFont(new Font("SansSerif", Font.BOLD, 11));

        JLabel title = new JLabel("Up to 30% OFF");
        title.setForeground(Color.WHITE);
        title.setFont(new Font("SansSerif", Font.BOLD, 25));

        JLabel subtitle = new JLabel("on all items");
        subtitle.setForeground(Color.WHITE);
        subtitle.setFont(new Font("SansSerif", Font.PLAIN, 13));

        JButton shop = new JButton("Shop Now");
        shop.setAlignmentX(Component.LEFT_ALIGNMENT);
        shop.setForeground(BRAND);
        shop.setBackground(Color.WHITE);
        shop.setFocusPainted(false);
        shop.addActionListener(e -> showMessage("Shop Now", "Dooro qayb si aad u bilowdo."));

        copy.add(eyebrow);
        copy.add(Box.createVerticalStrut(3));
        copy.add(title);
        copy.add(subtitle);
        copy.add(Box.createVerticalStrut(8));
        copy.add(shop);

        JLabel figure = new JLabel("🛍️");
        figure.setFont(new Font("Segoe UI Emoji", Font.PLAIN, 54));
        hero.add(copy, BorderLayout.CENTER);
        hero.add(figure, BorderLayout.EAST);
        return hero;
    }

    private JLabel sectionTitle(String text) {
        JLabel title = new JLabel(text);
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        title.setForeground(new Color(35, 29, 54));
        return title;
    }

    private JPanel createCategoryGrid() {
        JPanel grid = new JPanel(new GridLayout(3, 3, 10, 10));
        grid.setOpaque(false);

        String[][] categories = {
                {"💎", "Naadir"}, {"👗", "Women"}, {"👔", "Men"},
                {"⚽", "Sports"}, {"📱", "Electronics"}, {"🍼", "Baby"},
                {"🏗️", "Dhismaha"}, {"🍔", "Cunto"}, {"📦", "Others"}
        };

        for (String[] category : categories) {
            JButton card = new JButton("<html><center><font size='5'>" + category[0]
                    + "</font><br><b>" + category[1] + "</b></center></html>");
            card.setBackground(category[1].equals("Naadir") ? new Color(255, 248, 220) : Color.WHITE);
            card.setBorder(BorderFactory.createLineBorder(new Color(225, 226, 235)));
            card.setFocusPainted(false);
            card.addActionListener(e -> showMessage(category[1], "Waxaad dooratay qaybta " + category[1] + "."));
            grid.add(card);
        }
        return grid;
    }

    private JPanel createBottomNavigation() {
        JPanel nav = new JPanel(new GridLayout(1, 5));
        nav.setBackground(Color.WHITE);
        nav.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, new Color(230, 230, 238)));

        String[] items = {"🏠\nHome", "▦\nCategories", "🛒\nCart", "📋\nOrders", "👤\nAccount"};
        for (String item : items) {
            String[] parts = item.split("\\n");
            JButton button = new JButton("<html><center>" + parts[0] + "<br><small>" + parts[1] + "</small></center></html>");
            button.setBorderPainted(false);
            button.setFocusPainted(false);
            button.setBackground(Color.WHITE);
            button.addActionListener(e -> showMessage(parts[1], "Qaybta " + parts[1] + " ayaa la doortay."));
            nav.add(button);
        }
        return nav;
    }

    private void styleIconButton(JButton button) {
        button.setFont(new Font("SansSerif", Font.PLAIN, 22));
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(42, 38));
    }

    private void showMessage(String title, String message) {
        JOptionPane.showMessageDialog(this, message, title, JOptionPane.INFORMATION_MESSAGE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new WahenAppUI().setVisible(true));
    }
}
